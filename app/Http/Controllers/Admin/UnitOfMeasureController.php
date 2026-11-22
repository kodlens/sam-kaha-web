<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UnitOfMeasureController extends Controller
{
    /**
     * Display a listing of the units of measure.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $category = $request->input('category');

        $query = UnitOfMeasure::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== '') {
            $query->where('is_active', $status === 'active' || $status === '1' || $status === true);
        }

        if ($category) {
            $query->where('category', $category);
        }

        $uoms = $query->orderBy('name', 'asc')->get();

        $categories = UnitOfMeasure::select('category')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('admin/uom/index', [
            'uoms' => $uoms,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'category' => $category ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created unit of measure in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:units_of_measure,name'],
            'short_code' => ['required', 'string', 'max:20', 'unique:units_of_measure,short_code'],
            'category' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        UnitOfMeasure::create([
            'name' => $validated['name'],
            'short_code' => strtolower($validated['short_code']),
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Unit of Measure created successfully.');
    }

    /**
     * Update the specified unit of measure in storage.
     */
    public function update(Request $request, UnitOfMeasure $uom): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('units_of_measure', 'name')->ignore($uom->id),
            ],
            'short_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('units_of_measure', 'short_code')->ignore($uom->id),
            ],
            'category' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ]);

        $uom->update([
            'name' => $validated['name'],
            'short_code' => strtolower($validated['short_code']),
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Unit of Measure updated successfully.');
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleStatus(UnitOfMeasure $uom): RedirectResponse
    {
        $uom->update([
            'is_active' => ! $uom->is_active,
        ]);

        $statusStr = $uom->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Unit '{$uom->name}' has been {$statusStr}.");
    }

    /**
     * Remove the specified unit of measure from storage.
     */
    public function destroy(UnitOfMeasure $uom): RedirectResponse
    {
        $uom->delete();

        return redirect()->back()->with('success', 'Unit of Measure deleted successfully.');
    }
}
