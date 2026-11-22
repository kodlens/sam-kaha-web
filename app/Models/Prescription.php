<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'doctor_name',
        'doctor_license_no',
        'doctor_ptr_no',
        'patient_name',
        'patient_age',
        'patient_address',
    ];

    protected $casts = [
        'patient_age' => 'integer',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
