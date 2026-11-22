<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int $unit_of_measure_id
 * @property int $conversion_factor
 * @property string $price
 * @property string|null $cost
 * @property string|null $barcode
 * @property bool $is_base_unit
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property Product $product
 * @property UnitOfMeasure $unitOfMeasure
 */
class ProductUnit extends Model
{
    use HasFactory;

    protected $table = 'product_units';

    protected $fillable = [
        'product_id',
        'unit_of_measure_id',
        'conversion_factor',
        'price',
        'cost',
        'barcode',
        'is_base_unit',
    ];

    protected $casts = [
        'conversion_factor' => 'integer',
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_base_unit' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id');
    }
}
