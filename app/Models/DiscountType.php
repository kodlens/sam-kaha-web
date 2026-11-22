<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $percentage
 * @property bool $is_vat_exempt
 * @property bool $requires_id
 * @property bool $requires_booklet
 * @property string $applies_to
 * @property bool $is_statutory
 * @property string|null $legal_basis
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class DiscountType extends Model
{
    use HasFactory;

    protected $table = 'discount_types';

    protected $fillable = [
        'name',
        'code',
        'percentage',
        'is_vat_exempt',
        'requires_id',
        'requires_booklet',
        'applies_to',
        'is_statutory',
        'legal_basis',
        'description',
        'is_active',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'is_vat_exempt' => 'boolean',
        'requires_id' => 'boolean',
        'requires_booklet' => 'boolean',
        'is_statutory' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(StatutoryDiscountLog::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeStatutory(Builder $query): Builder
    {
        return $query->where('is_statutory', true);
    }
}
