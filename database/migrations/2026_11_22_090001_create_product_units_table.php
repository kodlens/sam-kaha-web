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
        Schema::create('product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('unit_of_measure_id')->constrained('units_of_measure')->cascadeOnDelete();
            $table->unsignedInteger('conversion_factor')->default(1); // How many base units equals 1 of this unit (e.g. 1 Box = 100 Pieces -> factor is 100)
            $table->decimal('price', 10, 2); // Retail / Selling price for this unit
            $table->decimal('cost', 10, 2)->nullable(); // Unit cost for this packaging unit
            $table->string('barcode')->nullable()->index(); // Packaging-specific barcode (e.g. box barcode vs piece barcode)
            $table->boolean('is_base_unit')->default(false); // Base dispensing denomination (usually Piece or Bottle)
            $table->timestamps();

            $table->unique(['product_id', 'unit_of_measure_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_units');
    }
};
