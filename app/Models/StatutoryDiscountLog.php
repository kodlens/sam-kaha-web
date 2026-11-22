<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $discount_type_id
 * @property string $customer_name
 * @property string $id_number
 * @property string|null $booklet_number
 * @property string $gross_amount
 * @property string $vat_exempt_amount
 * @property string $vat_relief_amount
 * @property string $discount_amount
 * @property string $net_amount
 * @property string|null $cashier_name
 * @property int|null $cashier_id
 * @property \Illuminate\Support\Carbon $recorded_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property DiscountType $discountType
 * @property User|null $cashier
 */
class StatutoryDiscountLog extends Model
{
    use HasFactory;

    protected $table = 'statutory_discount_logs';

    protected $fillable = [
        'discount_type_id',
        'customer_name',
        'id_number',
        'booklet_number',
        'gross_amount',
        'vat_exempt_amount',
        'vat_relief_amount',
        'discount_amount',
        'net_amount',
        'cashier_name',
        'cashier_id',
        'recorded_at',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'vat_exempt_amount' => 'decimal:2',
        'vat_relief_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function discountType(): BelongsTo
    {
        return $this->belongsTo(DiscountType::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
