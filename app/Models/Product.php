<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $product_type
 * @property string $brand_name
 * @property string|null $generic_name
 * @property string|null $dosage_strength
 * @property string|null $dosage_form
 * @property string|null $category
 * @property string $sku
 * @property string|null $barcode
 * @property string $classification
 * @property bool $requires_prescription
 * @property bool $is_vatable
 * @property bool $sc_pwd_discountable
 * @property int $reorder_level
 * @property string|null $storage_conditions
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Database\Eloquent\Collection<int, ProductUnit> $units
 * @property ProductUnit|null $baseUnit
 */
class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'product_type',
        'brand_name',
        'generic_name',
        'dosage_strength',
        'dosage_form',
        'category',
        'sku',
        'barcode',
        'classification',
        'requires_prescription',
        'is_vatable',
        'sc_pwd_discountable',
        'reorder_level',
        'storage_conditions',
        'description',
        'is_active',
    ];

    protected $casts = [
        'requires_prescription' => 'boolean',
        'is_vatable' => 'boolean',
        'sc_pwd_discountable' => 'boolean',
        'is_active' => 'boolean',
        'reorder_level' => 'integer',
    ];

    protected $appends = [
        'full_name',
    ];

    public function units(): HasMany
    {
        return $this->hasMany(ProductUnit::class)->with('unitOfMeasure');
    }

    public function baseUnit(): HasOne
    {
        return $this->hasOne(ProductUnit::class)->where('is_base_unit', true)->with('unitOfMeasure');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(ProductBatch::class)->orderBy('expiry_date', 'asc');
    }

    public function availableBatches(): HasMany
    {
        return $this->hasMany(ProductBatch::class)
            ->where('quantity_remaining', '>', 0)
            ->where('status', '!=', 'quarantined')
            ->whereDate('expiry_date', '>', now())
            ->orderBy('expiry_date', 'asc');
    }

    public function getTotalStockAttribute(): int
    {
        return (int) $this->batches()->sum('quantity_remaining');
    }

    public function getFullNameAttribute(): string
    {
        $strength = $this->dosage_strength ? " {$this->dosage_strength}" : '';
        $form = $this->dosage_form ? " {$this->dosage_form}" : '';

        if ($this->product_type === 'medicine' && $this->generic_name) {
            return "{$this->brand_name} ({$this->generic_name}{$strength}{$form})";
        }

        return trim("{$this->brand_name}{$strength}{$form}");
    }

    public function isMedicine(): bool
    {
        return $this->product_type === 'medicine';
    }

    public function isGrocery(): bool
    {
        return $this->product_type === 'grocery';
    }

    public function isMedicalSupply(): bool
    {
        return $this->product_type === 'medical_supply';
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeMedicines(Builder $query): Builder
    {
        return $query->where('product_type', 'medicine');
    }

    public function scopeGroceries(Builder $query): Builder
    {
        return $query->where('product_type', 'grocery');
    }

    public function scopeSupplies(Builder $query): Builder
    {
        return $query->where('product_type', 'medical_supply');
    }

    public function scopePrescription(Builder $query): Builder
    {
        return $query->where('requires_prescription', true);
    }

    public function scopeOtc(Builder $query): Builder
    {
        return $query->where('requires_prescription', false);
    }
}
