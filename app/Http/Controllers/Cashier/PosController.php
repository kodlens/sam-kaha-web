<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\DiscountType;
use App\Models\HeldCart;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StatutoryDiscountLog;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\UnitOfMeasure;
use App\Services\FefoInventoryService;
use App\Services\PhilippineDiscountService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        protected FefoInventoryService $fefoService,
        protected PhilippineDiscountService $discountService
    ) {}

    /**
     * Display the POS terminal.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeShift = $user->activeShift();

        // If admin has no active shift, auto-open an admin session shift for instant POS access
        if ($user->isAdmin() && ! $activeShift) {
            $activeShift = CashierShift::create([
                'cashier_id' => $user->id,
                'device_terminal_id' => 'ADMIN-TERM',
                'opening_float' => 2000.00,
                'expected_cash' => 2000.00,
                'status' => 'open',
                'opened_at' => Carbon::now(),
                'notes' => 'Administrator POS session active.',
            ]);
        }

        if ($activeShift) {
            $activeShift->load(['cashDrops']);
        }

        // Fetch products with units and remaining batch inventory
        $products = Product::with(['units.unitOfMeasure'])
            ->where('is_active', true)
            ->get()
            ->map(function ($product) {
                // Compute total available non-expired stock in base units
                $availableStock = ProductBatch::where('product_id', $product->id)
                    ->whereIn('status', ['active', 'near_expiry'])
                    ->where('quantity_remaining', '>', 0)
                    ->where('expiry_date', '>', now()->toDateString())
                    ->sum('quantity_remaining');

                $product->total_stock_base = (int) $availableStock;
                return $product;
            });

        // Discount options (SC, PWD, Solo Parent, etc.)
        $discountTypes = DiscountType::where('is_active', true)->get();

        // Cashier's held carts
        $heldCarts = HeldCart::where('cashier_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('cashier/pos', [
            'cashier' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'shift' => $activeShift,
            'products' => $products,
            'discountTypes' => $discountTypes,
            'heldCarts' => $heldCarts,
        ]);
    }

    /**
     * Process checkout & complete transaction.
     */
    public function checkout(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $shift = $user->activeShift();

        if (! $shift && $user->isAdmin()) {
            $shift = CashierShift::create([
                'cashier_id' => $user->id,
                'device_terminal_id' => 'ADMIN-TERM',
                'opening_float' => 2000.00,
                'expected_cash' => 2000.00,
                'status' => 'open',
                'opened_at' => Carbon::now(),
                'notes' => 'Administrator POS session active.',
            ]);
        }

        if (! $shift) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cannot process transaction without an active open shift. Please open a shift first.',
                ], 422);
            }
            return back()->with('error', 'Cannot process transaction without an active open shift. Please open a shift first.');
        }

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.unit_of_measure_id' => ['required', 'exists:units_of_measure,id'],
            'items.*.conversion_factor' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'discount_type_id' => ['nullable', 'exists:discount_types,id'],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'customer_id_number' => ['nullable', 'string', 'max:100'],
            'customer_booklet_number' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'in:cash,gcash,maya,card'],
            'payment_reference' => ['nullable', 'string', 'max:100'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            // Prescription fields (if cart contains Rx medicines)
            'doctor_name' => ['nullable', 'string', 'max:150'],
            'doctor_license_no' => ['nullable', 'string', 'max:100'],
            'doctor_ptr_no' => ['nullable', 'string', 'max:100'],
            'patient_name' => ['nullable', 'string', 'max:150'],
            'patient_age' => ['nullable', 'integer', 'min:0', 'max:150'],
            'patient_address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::beginTransaction();

        try {
            // Generate official sequential invoice number: INV-YYYYMMDD-XXXX
            $datePrefix = Carbon::now()->format('Ymd');
            $latestToday = Transaction::where('invoice_number', 'like', "INV-{$datePrefix}-%")
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            $nextSeq = 1;
            if ($latestToday && preg_match('/-(\d+)$/', $latestToday->invoice_number, $matches)) {
                $nextSeq = (int) $matches[1] + 1;
            }

            $invoiceNumber = 'INV-' . $datePrefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);

            // Fetch products and verify items
            $discountType = ! empty($validated['discount_type_id'])
                ? DiscountType::find($validated['discount_type_id'])
                : null;

            $requiresPrescription = false;

            // Prepare items data for Philippine statutory calculation
            $calculationItems = [];
            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                if ($product->requires_prescription) {
                    $requiresPrescription = true;
                }

                $calculationItems[] = [
                    'product_id' => $product->id,
                    'price' => (float) $itemData['unit_price'],
                    'quantity' => (int) $itemData['quantity'],
                    'is_vatable' => (bool) $product->is_vatable,
                    'sc_pwd_discountable' => (bool) $product->sc_pwd_discountable,
                ];
            }

            // Run Philippine BIR Tax & Discount Formula
            $discountCode = $discountType ? ($discountType->is_statutory ? 'SC' : $discountType->code) : 'NONE';
            $customPercentage = $discountType ? (float) $discountType->percentage : 0.0;
            $discountResult = $this->discountService->calculate($calculationItems, $discountCode, $customPercentage);

            $totalAmount = (float) $discountResult['net_payable'];
            $paidAmount = (float) $validated['paid_amount'];

            if ($paidAmount < $totalAmount && $validated['payment_method'] === 'cash') {
                throw new Exception('Paid amount ₱' . number_format($paidAmount, 2) . ' is less than total amount due ₱' . number_format($totalAmount, 2) . '.');
            }

            $changeAmount = max(0, round($paidAmount - $totalAmount, 2));

            // Create Transaction record
            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'cashier_shift_id' => $shift->id,
                'cashier_id' => $user->id,
                'subtotal' => $discountResult['gross_total'],
                'vatable_sales' => $discountResult['vatable_sales'],
                'vat_exempt_sales' => $discountResult['vat_exempt_sales'],
                'vat_amount' => $discountResult['vat_amount'],
                'vat_relief_amount' => $discountResult['vat_relief_amount'],
                'discount_amount' => $discountResult['discount_total'],
                'discount_type_id' => $discountType?->id,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_id_number' => $validated['customer_id_number'] ?? null,
                'customer_booklet_number' => $validated['customer_booklet_number'] ?? null,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Save items & execute FEFO inventory deduction
            foreach ($validated['items'] as $index => $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $uom = UnitOfMeasure::findOrFail($itemData['unit_of_measure_id']);

                $conversionFactor = (int) $itemData['conversion_factor'];
                $qty = (int) $itemData['quantity'];
                $qtyInBaseUnits = $qty * $conversionFactor;
                $unitPrice = (float) $itemData['unit_price'];
                $itemSubtotal = $unitPrice * $qty;

                // Execute FEFO stock deduction
                $allocations = $this->fefoService->deductFefo(
                    product: $product,
                    quantityInBaseUnits: $qtyInBaseUnits,
                    uom: $uom,
                    transactedQty: $qty,
                    referenceId: $transaction->invoice_number,
                    user: $user,
                    notes: "Dispensed via {$transaction->invoice_number}"
                );

                $firstBatchId = ! empty($allocations) ? $allocations[0]['batch_id'] : null;

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_batch_id' => $firstBatchId,
                    'unit_of_measure_id' => $uom->id,
                    'conversion_factor' => $conversionFactor,
                    'quantity' => $qty,
                    'quantity_in_base_units' => $qtyInBaseUnits,
                    'unit_price' => $unitPrice,
                    'subtotal' => $itemSubtotal,
                    'discount_amount' => 0.00, // Individual line discount if needed
                    'total_amount' => $itemSubtotal,
                    'is_vatable' => $product->is_vatable,
                    'sc_pwd_discountable' => $product->sc_pwd_discountable,
                ]);
            }

            // Save Prescription details if provided
            if (! empty($validated['doctor_name']) && ! empty($validated['patient_name'])) {
                Prescription::create([
                    'transaction_id' => $transaction->id,
                    'doctor_name' => $validated['doctor_name'],
                    'doctor_license_no' => $validated['doctor_license_no'] ?? 'N/A',
                    'doctor_ptr_no' => $validated['doctor_ptr_no'] ?? null,
                    'patient_name' => $validated['patient_name'],
                    'patient_age' => $validated['patient_age'] ?? null,
                    'patient_address' => $validated['patient_address'] ?? null,
                ]);
            }

            // Log BIR Statutory discount if applicable
            if ($discountType && $discountType->is_statutory && (float) $discountResult['discount_total'] > 0) {
                StatutoryDiscountLog::create([
                    'discount_type_id' => $discountType->id,
                    'customer_name' => $validated['customer_name'] ?? 'Senior/PWD Customer',
                    'id_number' => $validated['customer_id_number'] ?? 'N/A',
                    'booklet_number' => $validated['customer_booklet_number'] ?? null,
                    'gross_amount' => $discountResult['gross_total'],
                    'vat_exempt_amount' => $discountResult['vat_exempt_sales'],
                    'vat_relief_amount' => $discountResult['vat_relief_amount'],
                    'discount_amount' => $discountResult['discount_total'],
                    'net_amount' => $totalAmount,
                    'cashier_name' => $user->name,
                    'cashier_id' => $user->id,
                    'recorded_at' => Carbon::now(),
                ]);
            }

            // Update Cashier Shift drawer sales totals
            if ($validated['payment_method'] === 'cash') {
                $shift->cash_sales_total = (float) $shift->cash_sales_total + $totalAmount;
            } else {
                $shift->non_cash_sales_total = (float) $shift->non_cash_sales_total + $totalAmount;
            }
            $shift->recalculateTotals();

            DB::commit();

            // Load transaction details for thermal receipt payload
            $transaction->load(['items.product', 'items.unitOfMeasure', 'prescription', 'cashier']);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Transaction completed successfully!',
                    'transaction' => $transaction,
                ]);
            }

            return redirect()->route('cashier.pos')->with('success', 'Transaction #' . $transaction->invoice_number . ' completed.');
        } catch (Exception $e) {
            DB::rollBack();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage(),
                ], 422);
            }

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Park/Hold current cart.
     */
    public function holdCart(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'cart_reference' => ['required', 'string', 'max:100'],
            'cart_data' => ['required', 'array'],
        ]);

        $heldCart = HeldCart::create([
            'cashier_id' => $request->user()->id,
            'cart_reference' => $validated['cart_reference'],
            'cart_data' => $validated['cart_data'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'held_cart' => $heldCart,
            ]);
        }

        return back()->with('success', 'Cart parked under "' . $validated['cart_reference'] . '".');
    }

    /**
     * Delete a held cart.
     */
    public function deleteHeldCart(HeldCart $heldCart): JsonResponse|RedirectResponse
    {
        $heldCart->delete();

        return response()->json(['success' => true]);
    }
}
