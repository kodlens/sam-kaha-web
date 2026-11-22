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
            $table->enum('product_type', ['medicine', 'grocery', 'medical_supply'])->default('medicine');
            $table->string('brand_name');
            $table->string('generic_name')->nullable(); // Nullable for groceries (e.g. Soap, Mineral Water, Diapers)
            $table->string('dosage_strength')->nullable(); // Strength for meds (500mg) or Net content for groceries (500ml, 135g)
            $table->string('dosage_form')->nullable(); // Tablet, Capsule for meds; Pack, Bottle, Bar for groceries
            $table->string('category')->nullable(); // e.g. 'Analgesic', 'Antibiotic', 'Beverages', 'Toiletries', 'Baby Care'
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->index();
            $table->enum('classification', ['otc', 'prescription', 'dangerous_drug', 'general'])->default('otc');
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_vatable')->default(true); // Philippine TRAIN / CREATE VAT-Exempt medicines
            $table->boolean('sc_pwd_discountable')->default(true); // 20% SC/PWD discount (True for medicines/supplies, False for groceries)
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
