<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of medicine and grocery products.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $productType = $request->input('product_type');
        $classification = $request->input('classification');
        $category = $request->input('category');
        $vatStatus = $request->input('vat_status');
        $status = $request->input('status');

        $query = Product::with(['units.unitOfMeasure', 'baseUnit.unitOfMeasure']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('brand_name', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('dosage_strength', 'like', "%{$search}%");
            });
        }

        if ($productType) {
            $query->where('product_type', $productType);
        }

        if ($classification) {
            $query->where('classification', $classification);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($vatStatus !== null && $vatStatus !== '') {
            $query->where('is_vatable', $vatStatus === 'vatable' || $vatStatus === '1' || $vatStatus === true);
        }

        if ($status !== null && $status !== '') {
            $query->where('is_active', $status === 'active' || $status === '1' || $status === true);
        }

        $products = $query->orderBy('brand_name', 'asc')->get();

        $categories = Product::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        $unitsOfMeasure = UnitOfMeasure::active()->orderBy('name', 'asc')->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'unitsOfMeasure' => $unitsOfMeasure,
            'filters' => [
                'search' => $search ?? '',
                'product_type' => $productType ?? '',
                'classification' => $classification ?? '',
                'category' => $category ?? '',
                'vat_status' => $vatStatus ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created product (medicine or grocery).
     */
    public function store(Request $request): RedirectResponse
    {
        $productType = $request->input('product_type', 'medicine');

        $validated = $request->validate([
            'product_type' => ['required', 'in:medicine,grocery,medical_supply'],
            'brand_name' => ['required', 'string', 'max:150'],
            'generic_name' => [
                Rule::requiredIf($productType === 'medicine'),
                'nullable',
                'string',
                'max:200',
            ],
            'dosage_strength' => ['nullable', 'string', 'max:100'],
            'dosage_form' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'barcode' => ['nullable', 'string', 'max:50'],
            'classification' => ['required', 'in:otc,prescription,dangerous_drug,general'],
            'requires_prescription' => ['boolean'],
            'is_vatable' => ['boolean'],
            'sc_pwd_discountable' => ['boolean'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'storage_conditions' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'units' => ['required', 'array', 'min:1'],
            'units.*.unit_of_measure_id' => ['required', 'exists:units_of_measure,id'],
            'units.*.conversion_factor' => ['required', 'integer', 'min:1'],
            'units.*.price' => ['required', 'numeric', 'min:0'],
            'units.*.cost' => ['nullable', 'numeric', 'min:0'],
            'units.*.is_base_unit' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $request, $productType) {
            $isMedicine = $productType === 'medicine';
            $isSupply = $productType === 'medical_supply';

            // Groceries default to non-SC discountable unless explicitly flagged
            $scDiscountable = $isMedicine || $isSupply
                ? $request->boolean('sc_pwd_discountable', true)
                : $request->boolean('sc_pwd_discountable', false);

            $product = Product::create([
                'product_type' => $validated['product_type'],
                'brand_name' => $validated['brand_name'],
                'generic_name' => $validated['generic_name'] ?? null,
                'dosage_strength' => $validated['dosage_strength'] ?? null,
                'dosage_form' => $validated['dosage_form'] ?? null,
                'category' => $validated['category'] ?? null,
                'sku' => strtoupper($validated['sku']),
                'barcode' => $validated['barcode'] ?? null,
                'classification' => $validated['classification'],
                'requires_prescription' => $isMedicine && ($validated['classification'] !== 'otc' || $request->boolean('requires_prescription')),
                'is_vatable' => $request->boolean('is_vatable', true),
                'sc_pwd_discountable' => $scDiscountable,
                'reorder_level' => $validated['reorder_level'],
                'storage_conditions' => $validated['storage_conditions'] ?? null,
                'description' => $validated['description'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            foreach ($validated['units'] as $unitData) {
                ProductUnit::create([
                    'product_id' => $product->id,
                    'unit_of_measure_id' => $unitData['unit_of_measure_id'],
                    'conversion_factor' => $unitData['conversion_factor'],
                    'price' => $unitData['price'],
                    'cost' => $unitData['cost'] ?? null,
                    'is_base_unit' => $unitData['is_base_unit'] ?? false,
                ]);
            }
        });

        $typeLabel = ucfirst(str_replace('_', ' ', $validated['product_type']));

        return redirect()->back()->with('success', "{$typeLabel} '{$validated['brand_name']}' created successfully.");
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $productType = $request->input('product_type', $product->product_type);

        $validated = $request->validate([
            'product_type' => ['required', 'in:medicine,grocery,medical_supply'],
            'brand_name' => ['required', 'string', 'max:150'],
            'generic_name' => [
                Rule::requiredIf($productType === 'medicine'),
                'nullable',
                'string',
                'max:200',
            ],
            'dosage_strength' => ['nullable', 'string', 'max:100'],
            'dosage_form' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'barcode' => ['nullable', 'string', 'max:50'],
            'classification' => ['required', 'in:otc,prescription,dangerous_drug,general'],
            'requires_prescription' => ['boolean'],
            'is_vatable' => ['boolean'],
            'sc_pwd_discountable' => ['boolean'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'storage_conditions' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'units' => ['required', 'array', 'min:1'],
            'units.*.unit_of_measure_id' => ['required', 'exists:units_of_measure,id'],
            'units.*.conversion_factor' => ['required', 'integer', 'min:1'],
            'units.*.price' => ['required', 'numeric', 'min:0'],
            'units.*.cost' => ['nullable', 'numeric', 'min:0'],
            'units.*.is_base_unit' => ['boolean'],
        ]);

        DB::transaction(function () use ($product, $validated, $request, $productType) {
            $isMedicine = $productType === 'medicine';
            $isSupply = $productType === 'medical_supply';

            $scDiscountable = $isMedicine || $isSupply
                ? $request->boolean('sc_pwd_discountable', true)
                : $request->boolean('sc_pwd_discountable', false);

            $product->update([
                'product_type' => $validated['product_type'],
                'brand_name' => $validated['brand_name'],
                'generic_name' => $validated['generic_name'] ?? null,
                'dosage_strength' => $validated['dosage_strength'] ?? null,
                'dosage_form' => $validated['dosage_form'] ?? null,
                'category' => $validated['category'] ?? null,
                'sku' => strtoupper($validated['sku']),
                'barcode' => $validated['barcode'] ?? null,
                'classification' => $validated['classification'],
                'requires_prescription' => $isMedicine && ($validated['classification'] !== 'otc' || $request->boolean('requires_prescription')),
                'is_vatable' => $request->boolean('is_vatable', true),
                'sc_pwd_discountable' => $scDiscountable,
                'reorder_level' => $validated['reorder_level'],
                'storage_conditions' => $validated['storage_conditions'] ?? null,
                'description' => $validated['description'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $submittedUomIds = collect($validated['units'])->pluck('unit_of_measure_id')->toArray();
            $product->units()->whereNotIn('unit_of_measure_id', $submittedUomIds)->delete();

            foreach ($validated['units'] as $unitData) {
                ProductUnit::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'unit_of_measure_id' => $unitData['unit_of_measure_id'],
                    ],
                    [
                        'conversion_factor' => $unitData['conversion_factor'],
                        'price' => $unitData['price'],
                        'cost' => $unitData['cost'] ?? null,
                        'is_base_unit' => $unitData['is_base_unit'] ?? false,
                    ]
                );
            }
        });

        return redirect()->back()->with('success', "Item '{$validated['brand_name']}' updated successfully.");
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleStatus(Product $product): RedirectResponse
    {
        $product->update([
            'is_active' => ! $product->is_active,
        ]);

        $statusStr = $product->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Item '{$product->brand_name}' has been {$statusStr}.");
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->brand_name;
        $product->delete();

        return redirect()->back()->with('success', "Item '{$name}' deleted successfully.");
    }
}
