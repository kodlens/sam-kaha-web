<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftAuditController extends Controller
{
    /**
     * Display cashier shift log and audit drawer.
     */
    public function index(Request $request): Response
    {
        $query = CashierShift::with(['cashier:id,name,email', 'cashDrops.authorizer:id,name'])
            ->latest('opened_at');

        // Cashier filter
        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->integer('cashier_id'));
        }

        // Status filter
        if ($request->filled('status') && in_array($request->input('status'), ['open', 'closed'])) {
            $query->where('status', $request->input('status'));
        }

        // Discrepancy filter
        if ($request->filled('discrepancy')) {
            $discrepancy = $request->input('discrepancy');
            if ($discrepancy === 'balanced') {
                $query->where('status', 'closed')->whereRaw('ABS(cash_difference) < 0.01');
            } elseif ($discrepancy === 'overage') {
                $query->where('status', 'closed')->where('cash_difference', '>', 0.01);
            } elseif ($discrepancy === 'shortage') {
                $query->where('status', 'closed')->where('cash_difference', '<', -0.01);
            }
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('opened_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('opened_at', '<=', $request->input('date_to'));
        }

        $shifts = $query->paginate(20)->withQueryString();

        // Calculate KPI metrics
        $allOpenShifts = CashierShift::where('status', 'open')->get();
        $activeOpenCount = $allOpenShifts->count();
        $totalDrawerCashActive = $allOpenShifts->sum(function ($shift) {
            return (float) $shift->current_drawer_cash;
        });

        $totalCompletedShifts = CashierShift::where('status', 'closed')->count();
        $netCashVariance = CashierShift::where('status', 'closed')->sum('cash_difference');
        $todayDropsTotal = CashierShift::whereDate('opened_at', Carbon::today())->sum('cash_drops_total');

        $cashiers = User::whereIn('role', ['cashier', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return Inertia::render('admin/shifts/index', [
            'shifts' => $shifts,
            'metrics' => [
                'active_open_count' => $activeOpenCount,
                'total_drawer_cash_active' => (float) $totalDrawerCashActive,
                'total_completed_shifts' => $totalCompletedShifts,
                'net_cash_variance' => (float) $netCashVariance,
                'today_drops_total' => (float) $todayDropsTotal,
            ],
            'cashiers' => $cashiers,
            'filters' => $request->only(['cashier_id', 'status', 'discrepancy', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Admin force-close an abandoned shift.
     */
    public function forceClose(Request $request, CashierShift $shift): RedirectResponse
    {
        if ($shift->status !== 'open') {
            return back()->with('error', 'This shift is already closed.');
        }

        $validated = $request->validate([
            'closing_cash' => ['required', 'numeric', 'min:0'],
            'admin_notes' => ['required', 'string', 'max:500'],
        ]);

        $shift->recalculateTotals();

        $expectedCash = (float) $shift->expected_cash;
        $closingCash = (float) $validated['closing_cash'];
        $diff = round($closingCash - $expectedCash, 2);

        $shift->update([
            'closing_cash' => $closingCash,
            'cash_difference' => $diff,
            'status' => 'closed',
            'closed_at' => Carbon::now(),
            'notes' => ($shift->notes ? $shift->notes . "\n" : '') . "[ADMIN OVERRIDE: Closed by " . $request->user()->name . "]: " . $validated['admin_notes'],
        ]);

        return back()->with('success', "Shift #{$shift->id} was forcefully closed by administrator.");
    }
}
