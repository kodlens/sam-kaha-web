<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiscountType;
use App\Models\Product;
use App\Models\StatutoryDiscountLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    /**
     * Display discount configurations and BIR statutory discount audit log.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $discountCode = $request->input('discount_code');

        $discountTypes = DiscountType::orderBy('is_statutory', 'desc')->orderBy('name', 'asc')->get();

        $logQuery = StatutoryDiscountLog::with(['discountType', 'cashier']);

        if ($search) {
            $logQuery->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('id_number', 'like', "%{$search}%")
                    ->orWhere('booklet_number', 'like', "%{$search}%");
            });
        }

        if ($discountCode) {
            $logQuery->whereHas('discountType', function ($q) use ($discountCode) {
                $q->where('code', $discountCode);
            });
        }

        $logs = $logQuery->orderBy('recorded_at', 'desc')->get();

        // Calculate summary metrics for BIR tax reporting
        $allLogs = StatutoryDiscountLog::with('discountType')->get();
        $totalDiscountGiven = $allLogs->sum('discount_amount');
        $totalVatReliefGiven = $allLogs->sum('vat_relief_amount');
        $totalBeneficiarySales = $allLogs->sum('net_amount');

        $seniorLogs = $allLogs->filter(fn ($l) => $l->discountType?->code === 'SC');
        $pwdLogs = $allLogs->filter(fn ($l) => $l->discountType?->code === 'PWD');

        // Products for the interactive formula sandbox
        $sampleProducts = Product::active()
            ->with(['baseUnit.unitOfMeasure', 'units.unitOfMeasure'])
            ->get(['id', 'brand_name', 'generic_name', 'product_type', 'is_vatable', 'sc_pwd_discountable']);

        return Inertia::render('admin/discounts/index', [
            'discountTypes' => $discountTypes,
            'logs' => $logs,
            'products' => $sampleProducts,
            'metrics' => [
                'totalDiscountGiven' => (float) $totalDiscountGiven,
                'totalVatReliefGiven' => (float) $totalVatReliefGiven,
                'totalBeneficiarySales' => (float) $totalBeneficiarySales,
                'seniorCount' => $seniorLogs->count(),
                'pwdCount' => $pwdLogs->count(),
            ],
            'filters' => [
                'search' => $search ?? '',
                'discount_code' => $discountCode ?? '',
            ],
        ]);
    }

    /**
     * Store a new custom discount rule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:30', 'unique:discount_types,code'],
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_vat_exempt' => ['boolean'],
            'requires_id' => ['boolean'],
            'requires_booklet' => ['boolean'],
            'applies_to' => ['required', 'in:medicines_and_supplies,all,groceries_only'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        DiscountType::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'percentage' => $validated['percentage'],
            'is_vat_exempt' => $request->boolean('is_vat_exempt', false),
            'requires_id' => $request->boolean('requires_id', false),
            'requires_booklet' => $request->boolean('requires_booklet', false),
            'applies_to' => $validated['applies_to'],
            'is_statutory' => false,
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', "Discount rule '{$validated['name']}' created successfully.");
    }

    /**
     * Update an existing discount rule.
     */
    public function update(Request $request, DiscountType $discount): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $discount->update([
            'name' => $validated['name'],
            'percentage' => $validated['percentage'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', "Discount rule '{$discount->name}' updated successfully.");
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(DiscountType $discount): RedirectResponse
    {
        $discount->update(['is_active' => ! $discount->is_active]);

        $msg = $discount->is_active
            ? "Discount rule '{$discount->name}' activated."
            : "Discount rule '{$discount->name}' deactivated.";

        return redirect()->back()->with('success', $msg);
    }
}
