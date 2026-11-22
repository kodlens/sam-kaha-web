<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name');
            $table->string('generic_name');
            $table->string('dosage_strength')->nullable(); // e.g. '500mg', '120mg/5ml', '50mg'
            $table->string('dosage_form')->nullable(); // e.g. 'Tablet', 'Capsule', 'Syrup', 'Suspension'
            $table->string('category')->nullable(); // e.g. 'Analgesic', 'Antibiotic', 'Antihypertensive'
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->index();
            $table->enum('classification', ['otc', 'prescription', 'dangerous_drug'])->default('otc');
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_vatable')->default(true); // Philippine TRAIN / CREATE VAT-Exempt medicines
            $table->integer('reorder_level')->default(10);
            $table->text('storage_conditions')->nullable(); // e.g. 'Store below 30°C'
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
