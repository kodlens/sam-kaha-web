<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HeldCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'cart_reference',
        'cart_data',
    ];

    protected $casts = [
        'cart_data' => 'array',
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}
