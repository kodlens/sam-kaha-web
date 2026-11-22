<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftCashDrop extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_shift_id',
        'cashier_id',
        'type',
        'amount',
        'reason',
        'authorized_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Parent shift.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }

    /**
     * Cashier who logged the drop.
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * Manager or admin who authorized this drop.
     */
    public function authorizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }
}
