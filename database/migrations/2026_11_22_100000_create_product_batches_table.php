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
        Schema::create('product_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('batch_number')->index();
            $table->date('expiry_date')->index();
            $table->date('manufacturing_date')->nullable();
            $table->date('received_date')->nullable();
            $table->unsignedInteger('quantity_received'); // In base units (e.g. pieces, bottles, bars)
            $table->unsignedInteger('quantity_remaining'); // Remaining sellable stock
            $table->decimal('unit_cost', 10, 2); // Cost price per base unit
            $table->string('supplier_name')->nullable();
            $table->string('supplier_invoice_no')->nullable();
            $table->enum('status', ['active', 'near_expiry', 'expired', 'quarantined', 'depleted'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'expiry_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_batches');
    }
};
