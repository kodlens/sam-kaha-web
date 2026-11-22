<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\ShiftCashDrop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ShiftController extends Controller
{
    /**
     * Open a new shift for the authenticated cashier.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if cashier already has an active shift
        if ($user->activeShift()) {
            return back()->with('error', 'You already have an active open shift (#'.$user->activeShift()->id.'). Please close it first.');
        }

        $validated = $request->validate([
            'opening_float' => ['required', 'numeric', 'min:0'],
            'device_terminal_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $shift = CashierShift::create([
            'cashier_id' => $user->id,
            'device_terminal_id' => $validated['device_terminal_id'] ?? 'TERM-01',
            'opening_float' => $validated['opening_float'],
            'cash_sales_total' => 0.00,
            'non_cash_sales_total' => 0.00,
            'cash_drops_total' => 0.00,
            'expected_cash' => $validated['opening_float'],
            'status' => 'open',
            'opened_at' => Carbon::now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('cashier.pos')->with('success', 'Shift #'.$shift->id.' successfully opened with starting float ₱'.number_format((float)$shift->opening_float, 2).'.');
    }

    /**
     * Record a mid-shift cash drop, petty cash disbursement, or float replenishment.
     */
    public function cashDrop(Request $request, CashierShift $shift): RedirectResponse
    {
        if ($shift->status !== 'open') {
            return back()->with('error', 'Cannot record cash movement on a closed shift.');
        }

        $validated = $request->validate([
            'type' => ['required', 'in:drop_to_vault,petty_cash_expense,float_replenishment'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
            'manager_pin' => ['nullable', 'string'],
        ]);

        $authorizerId = null;
        if (! empty($validated['manager_pin'])) {
            $admin = User::where('role', 'admin')->where('pin', $validated['manager_pin'])->first();
            if ($admin) {
                $authorizerId = $admin->id;
            }
        }

        ShiftCashDrop::create([
            'cashier_shift_id' => $shift->id,
            'cashier_id' => $request->user()->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'authorized_by' => $authorizerId,
        ]);

        $shift->recalculateTotals();

        $actionLabel = match ($validated['type']) {
            'drop_to_vault' => 'Cash drop to vault',
            'petty_cash_expense' => 'Petty cash disbursement',
            'float_replenishment' => 'Float replenishment',
        };

        return back()->with('success', "{$actionLabel} of ₱".number_format((float)$validated['amount'], 2).' successfully logged.');
    }

    /**
     * Close shift & perform Z-Reading calculation.
     */
    public function close(Request $request, CashierShift $shift): RedirectResponse
    {
        if ($shift->status !== 'open') {
            return back()->with('error', 'This shift is already closed.');
        }

        $validated = $request->validate([
            'closing_cash' => ['required', 'numeric', 'min:0'],
            'denomination_breakdown' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Refresh latest sales totals & drops
        $shift->recalculateTotals();

        $expectedCash = (float) $shift->expected_cash;
        $closingCash = (float) $validated['closing_cash'];
        $difference = round($closingCash - $expectedCash, 2);

        $shift->update([
            'closing_cash' => $closingCash,
            'cash_difference' => $difference,
            'denomination_breakdown' => $validated['denomination_breakdown'] ?? null,
            'status' => 'closed',
            'closed_at' => Carbon::now(),
            'notes' => $validated['notes'] ?? $shift->notes,
        ]);

        $diffMsg = abs($difference) < 0.01 
            ? 'Cash count is perfectly balanced.' 
            : ($difference > 0 
                ? 'Cash drawer has an OVERAGE of +₱'.number_format($difference, 2).'.' 
                : 'Cash drawer has a SHORTAGE of -₱'.number_format(abs($difference), 2).'.');

        return redirect()->route('cashier.pos')->with('success', "Shift #{$shift->id} closed successfully (Z-Reading completed). {$diffMsg}");
    }

    /**
     * Fetch shift X-Reading or Z-Reading data.
     */
    public function reading(CashierShift $shift): JsonResponse
    {
        $shift->load(['cashier:id,name,email', 'cashDrops.authorizer:id,name']);

        return response()->json([
            'reading_type' => $shift->status === 'open' ? 'X-Reading (Interim)' : 'Z-Reading (End of Shift)',
            'shift' => $shift,
        ]);
    }
}
