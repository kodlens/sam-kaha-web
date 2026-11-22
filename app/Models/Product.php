<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $brand_name
 * @property string $generic_name
 * @property string|null $dosage_strength
 * @property string|null $dosage_form
 * @property string|null $category
 * @property string $sku
 * @property string|null $barcode
 * @property string $classification
 * @property bool $requires_prescription
 * @property bool $is_vatable
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
        'reorder_level',
        'storage_conditions',
        'description',
        'is_active',
    ];

    protected $casts = [
        'requires_prescription' => 'boolean',
        'is_vatable' => 'boolean',
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

    public function getFullNameAttribute(): string
    {
        $strength = $this->dosage_strength ? " {$this->dosage_strength}" : '';
        $form = $this->dosage_form ? " {$this->dosage_form}" : '';

        return "{$this->brand_name} ({$this->generic_name}{$strength}{$form})";
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
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
