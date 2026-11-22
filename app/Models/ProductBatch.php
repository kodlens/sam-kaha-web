<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property string $batch_number
 * @property \Carbon\Carbon $expiry_date
 * @property \Carbon\Carbon|null $manufacturing_date
 * @property \Carbon\Carbon|null $received_date
 * @property int $quantity_received
 * @property int $quantity_remaining
 * @property string $unit_cost
 * @property string|null $supplier_name
 * @property string|null $supplier_invoice_no
 * @property string $status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Product $product
 */
class ProductBatch extends Model
{
    use HasFactory;

    protected $table = 'product_batches';

    protected $fillable = [
        'product_id',
        'batch_number',
        'expiry_date',
        'manufacturing_date',
        'received_date',
        'quantity_received',
        'quantity_remaining',
        'unit_cost',
        'supplier_name',
        'supplier_invoice_no',
        'status',
        'notes',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'manufacturing_date' => 'date',
        'received_date' => 'date',
        'quantity_received' => 'integer',
        'quantity_remaining' => 'integer',
        'unit_cost' => 'decimal:2',
    ];

    protected $appends = [
        'days_until_expiry',
        'computed_status',
        'total_cost_value',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getDaysUntilExpiryAttribute(): int
    {
        if (! $this->expiry_date) {
            return 999;
        }

        return (int) Carbon::now()->startOfDay()->diffInDays($this->expiry_date->startOfDay(), false);
    }

    public function getComputedStatusAttribute(): string
    {
        if ($this->status === 'quarantined') {
            return 'quarantined';
        }

        if ($this->quantity_remaining <= 0) {
            return 'depleted';
        }

        $days = $this->days_until_expiry;

        if ($days <= 0) {
            return 'expired';
        }

        if ($days <= 90) {
            return 'near_expiry';
        }

        return 'active';
    }

    public function getTotalCostValueAttribute(): float
    {
        return (float) $this->unit_cost * $this->quantity_remaining;
    }

    public function scopeFefo(Builder $query): Builder
    {
        return $query->orderBy('expiry_date', 'asc');
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('quantity_remaining', '>', 0)
            ->where('status', '!=', 'quarantined')
            ->whereDate('expiry_date', '>', now());
    }

    public function scopeNearExpiry(Builder $query, int $days = 90): Builder
    {
        return $query->where('quantity_remaining', '>', 0)
            ->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereDate('expiry_date', '<=', now());
    }
}
