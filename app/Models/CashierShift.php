<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'device_terminal_id',
        'opening_float',
        'cash_sales_total',
        'non_cash_sales_total',
        'cash_drops_total',
        'expected_cash',
        'closing_cash',
        'cash_difference',
        'denomination_breakdown',
        'status',
        'opened_at',
        'closed_at',
        'notes',
    ];

    protected $casts = [
        'opening_float' => 'decimal:2',
        'cash_sales_total' => 'decimal:2',
        'non_cash_sales_total' => 'decimal:2',
        'cash_drops_total' => 'decimal:2',
        'expected_cash' => 'decimal:2',
        'closing_cash' => 'decimal:2',
        'cash_difference' => 'decimal:2',
        'denomination_breakdown' => 'array',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected $appends = [
        'current_drawer_cash',
        'is_over_short',
    ];

    /**
     * Cashier who owns this shift.
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * Cash drops or drawer payouts during this shift.
     */
    public function cashDrops(): HasMany
    {
        return $this->hasMany(ShiftCashDrop::class, 'cashier_shift_id');
    }

    /**
     * Scope for currently open shifts.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope for closed shifts.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Computed attribute: Current drawer cash (Float + Cash Sales - Drops).
     */
    public function getCurrentDrawerCashAttribute(): float
    {
        return round(
            (float) $this->opening_float + 
            (float) $this->cash_sales_total - 
            (float) $this->cash_drops_total,
            2
        );
    }

    /**
     * Computed attribute: Description of over/short status.
     */
    public function getIsOverShortAttribute(): string
    {
        if ($this->status === 'open' || $this->cash_difference === null) {
            return 'in_progress';
        }

        $diff = (float) $this->cash_difference;
        if (abs($diff) < 0.01) {
            return 'balanced';
        }

        return $diff > 0 ? 'overage' : 'shortage';
    }

    /**
     * Recalculate totals and expected cash for this shift.
     */
    public function recalculateTotals(): void
    {
        // Sum drops:
        $dropsTotal = $this->cashDrops()
            ->where('type', '!=', 'float_replenishment')
            ->sum('amount');

        $replenishments = $this->cashDrops()
            ->where('type', 'float_replenishment')
            ->sum('amount');

        $this->cash_drops_total = $dropsTotal - $replenishments;
        $this->expected_cash = round((float) $this->opening_float + (float) $this->cash_sales_total - (float) $this->cash_drops_total, 2);

        if ($this->closing_cash !== null) {
            $this->cash_difference = round((float) $this->closing_cash - (float) $this->expected_cash, 2);
        }

        $this->save();
    }
}
