<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    /**
     * Display a listing of product batches & expiry alert center.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $urgency = $request->input('urgency');
        $productId = $request->input('product_id');

        $now = Carbon::now();

        $query = ProductBatch::with(['product.baseUnit.unitOfMeasure']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%")
                    ->orWhere('supplier_invoice_no', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('brand_name', 'like', "%{$search}%")
                            ->orWhere('generic_name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%");
                    });
            });
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($urgency === '30_days') {
            $query->where('quantity_remaining', '>', 0)
                ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(30)->toDateString()]);
        } elseif ($urgency === '60_days') {
            $query->where('quantity_remaining', '>', 0)
                ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(60)->toDateString()]);
        } elseif ($urgency === '90_days') {
            $query->where('quantity_remaining', '>', 0)
                ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(90)->toDateString()]);
        }

        if ($status && $status !== 'all') {
            if ($status === 'expired') {
                $query->where('expiry_date', '<=', $now->toDateString());
            } elseif ($status === 'near_expiry') {
                $query->where('quantity_remaining', '>', 0)
                    ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(90)->toDateString()]);
            } else {
                $query->where('status', $status);
            }
        }

        // FEFO Ordering: batches expiring earliest appear first!
        $batches = $query->orderBy('expiry_date', 'asc')->get();

        // Calculate summary KPI statistics
        $allBatches = ProductBatch::all();
        $totalBatches = $allBatches->count();
        $totalUnitsInStock = $allBatches->sum('quantity_remaining');
        $totalInventoryValue = $allBatches->reduce(function ($carry, $b) {
            return $carry + ((float) $b->unit_cost * (int) $b->quantity_remaining);
        }, 0);

        $criticalExpiryCount = ProductBatch::where('quantity_remaining', '>', 0)
            ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(30)->toDateString()])
            ->count();

        $nearExpiryCount = ProductBatch::where('quantity_remaining', '>', 0)
            ->whereBetween('expiry_date', [$now->toDateString(), $now->copy()->addDays(90)->toDateString()])
            ->count();

        $expiredCount = ProductBatch::where('quantity_remaining', '>', 0)
            ->where('expiry_date', '<=', $now->toDateString())
            ->count();

        $quarantinedCount = ProductBatch::where('status', 'quarantined')->count();

        // Available products for stock-in dropdown
        $products = Product::active()
            ->with('baseUnit.unitOfMeasure')
            ->orderBy('brand_name', 'asc')
            ->get(['id', 'brand_name', 'generic_name', 'dosage_strength', 'sku', 'product_type']);

        return Inertia::render('admin/batches/index', [
            'batches' => $batches,
            'products' => $products,
            'metrics' => [
                'totalBatches' => $totalBatches,
                'totalUnitsInStock' => $totalUnitsInStock,
                'totalInventoryValue' => $totalInventoryValue,
                'criticalExpiryCount' => $criticalExpiryCount,
                'nearExpiryCount' => $nearExpiryCount,
                'expiredCount' => $expiredCount,
                'quarantinedCount' => $quarantinedCount,
            ],
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'urgency' => $urgency ?? '',
                'product_id' => $productId ?? '',
            ],
        ]);
    }

    /**
     * Receive new inventory stock / batch.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'batch_number' => ['required', 'string', 'max:100'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'manufacturing_date' => ['nullable', 'date'],
            'received_date' => ['nullable', 'date'],
            'quantity_received' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
            'supplier_invoice_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'expiry_date.after' => 'Cannot receive already-expired batches into active inventory.',
        ]);

        $expiryDate = Carbon::parse($validated['expiry_date']);
        $daysUntil = Carbon::now()->diffInDays($expiryDate, false);

        $status = 'active';
        if ($daysUntil <= 90) {
            $status = 'near_expiry';
        }

        ProductBatch::create([
            'product_id' => $validated['product_id'],
            'batch_number' => strtoupper($validated['batch_number']),
            'expiry_date' => $validated['expiry_date'],
            'manufacturing_date' => $validated['manufacturing_date'] ?? null,
            'received_date' => $validated['received_date'] ?? Carbon::now()->toDateString(),
            'quantity_received' => $validated['quantity_received'],
            'quantity_remaining' => $validated['quantity_received'], // Initially all remaining
            'unit_cost' => $validated['unit_cost'],
            'supplier_name' => $validated['supplier_name'] ?? null,
            'supplier_invoice_no' => $validated['supplier_invoice_no'] ?? null,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Stock received for Batch '{$validated['batch_number']}' successfully.");
    }

    /**
     * Update the batch information.
     */
    public function update(Request $request, ProductBatch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'batch_number' => ['required', 'string', 'max:100'],
            'expiry_date' => ['required', 'date'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
            'supplier_invoice_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $batch->update([
            'batch_number' => strtoupper($validated['batch_number']),
            'expiry_date' => $validated['expiry_date'],
            'unit_cost' => $validated['unit_cost'],
            'supplier_name' => $validated['supplier_name'] ?? null,
            'supplier_invoice_no' => $validated['supplier_invoice_no'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Batch '{$batch->batch_number}' updated successfully.");
    }

    /**
     * Quarantine a batch to prevent dispensing.
     */
    public function quarantine(ProductBatch $batch): RedirectResponse
    {
        $newStatus = $batch->status === 'quarantined' ? 'active' : 'quarantined';
        $batch->update(['status' => $newStatus]);

        $msg = $newStatus === 'quarantined'
            ? "Batch '{$batch->batch_number}' has been quarantined and locked from dispensing."
            : "Batch '{$batch->batch_number}' quarantine lifted. Available for dispensing.";

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Adjust stock count for shrinkage, damage, audit, or write-off.
     */
    public function adjustStock(Request $request, ProductBatch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_remaining' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $prev = $batch->quantity_remaining;
        $diff = $validated['quantity_remaining'] - $prev;

        $batch->update([
            'quantity_remaining' => $validated['quantity_remaining'],
            'notes' => trim(($batch->notes ? "{$batch->notes}\n" : '') . "[" . now()->format('Y-m-d H:i') . "] Adjusted from {$prev} to {$validated['quantity_remaining']} ({$validated['reason']})"),
        ]);

        return redirect()->back()->with('success', "Stock adjusted by {$diff} units for Batch '{$batch->batch_number}'.");
    }
}
