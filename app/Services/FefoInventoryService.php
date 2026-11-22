<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use App\Models\UnitOfMeasure;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class FefoInventoryService
{
    /**
     * Deduct inventory for a product using FEFO (First-Expired, First-Out).
     *
     * @param Product $product
     * @param int $quantityInBaseUnits Total units to deduct
     * @param UnitOfMeasure $uom The packaging unit sold (Box, Strip, Piece, Can, etc.)
     * @param int|float $transactedQty The quantity of packaging units sold
     * @param string $referenceId The Invoice number or transaction ID
     * @param User|null $user The cashier or user executing the transaction
     * @param string|null $notes
     * @return array Array of batch allocation records
     * @throws Exception
     */
    public function deductFefo(
        Product $product,
        int $quantityInBaseUnits,
        UnitOfMeasure $uom,
        int|float $transactedQty,
        string $referenceId,
        ?User $user = null,
        ?string $notes = null
    ): array {
        if ($quantityInBaseUnits <= 0) {
            return [];
        }

        // Fetch valid active or near-expiry batches ordered by earliest expiry date (FEFO)
        $batches = ProductBatch::where('product_id', $product->id)
            ->whereIn('status', ['active', 'near_expiry'])
            ->where('quantity_remaining', '>', 0)
            ->where('expiry_date', '>', now()->toDateString()) // Exclude past-expiry
            ->orderBy('expiry_date', 'asc')
            ->orderBy('id', 'asc')
            ->lockForUpdate()
            ->get();

        $totalAvailable = $batches->sum('quantity_remaining');

        $remainingToDeduct = $quantityInBaseUnits;
        $allocations = [];

        // Current product overall balance across all batches
        $currentProductBalance = ProductBatch::where('product_id', $product->id)
            ->whereIn('status', ['active', 'near_expiry'])
            ->sum('quantity_remaining');

        foreach ($batches as $batch) {
            if ($remainingToDeduct <= 0) {
                break;
            }

            $deductFromBatch = min($batch->quantity_remaining, $remainingToDeduct);
            $batchBalanceBefore = $batch->quantity_remaining;
            $batchBalanceAfter = $batchBalanceBefore - $deductFromBatch;

            $batch->quantity_remaining = $batchBalanceAfter;
            if ($batchBalanceAfter <= 0) {
                $batch->status = 'depleted';
            }
            $batch->save();

            $balanceBefore = $currentProductBalance;
            $balanceAfter = $balanceBefore - $deductFromBatch;
            $currentProductBalance = $balanceAfter;

            // Log stock movement
            StockMovement::create([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'unit_of_measure_id' => $uom->id,
                'movement_type' => 'sale',
                'quantity' => $transactedQty,
                'quantity_in_base_units' => -$deductFromBatch,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => 'transaction',
                'reference_id' => $referenceId,
                'user_id' => $user?->id,
                'notes' => $notes ?? "POS Sale (Batch {$batch->batch_number}, exp: {$batch->expiry_date->format('Y-m-d')})",
            ]);

            $allocations[] = [
                'batch_id' => $batch->id,
                'batch_number' => $batch->batch_number,
                'expiry_date' => $batch->expiry_date->format('Y-m-d'),
                'deducted_base_units' => $deductFromBatch,
            ];

            $remainingToDeduct -= $deductFromBatch;
        }

        // If not enough batch stock, still log negative movement for audit trail
        if ($remainingToDeduct > 0) {
            $balanceBefore = $currentProductBalance;
            $balanceAfter = $balanceBefore - $remainingToDeduct;

            StockMovement::create([
                'product_id' => $product->id,
                'product_batch_id' => null,
                'unit_of_measure_id' => $uom->id,
                'movement_type' => 'sale',
                'quantity' => $transactedQty,
                'quantity_in_base_units' => -$remainingToDeduct,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => 'transaction',
                'reference_id' => $referenceId,
                'user_id' => $user?->id,
                'notes' => ($notes ?? 'POS Sale') . ' [Unallocated - Exceeded available lot stock]',
            ]);

            $allocations[] = [
                'batch_id' => null,
                'batch_number' => 'UNALLOCATED',
                'expiry_date' => null,
                'deducted_base_units' => $remainingToDeduct,
            ];
        }

        return $allocations;
    }
}
