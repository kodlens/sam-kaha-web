<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'cashier_shift_id',
        'cashier_id',
        'subtotal',
        'vatable_sales',
        'vat_exempt_sales',
        'vat_amount',
        'vat_relief_amount',
        'discount_amount',
        'discount_type_id',
        'customer_name',
        'customer_id_number',
        'customer_booklet_number',
        'total_amount',
        'paid_amount',
        'change_amount',
        'payment_method',
        'payment_reference',
        'status',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'vatable_sales' => 'decimal:2',
        'vat_exempt_sales' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'vat_relief_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function discountType(): BelongsTo
    {
        return $this->belongsTo(DiscountType::class, 'discount_type_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class, 'transaction_id');
    }

    public function prescription(): HasOne
    {
        return $this->hasOne(Prescription::class, 'transaction_id');
    }
}
