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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 50)->unique();
            $table->foreignId('cashier_shift_id')->constrained('cashier_shifts')->cascadeOnDelete();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            
            // Philippine Tax & Statutory Breakdown
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('vatable_sales', 12, 2)->default(0.00);
            $table->decimal('vat_exempt_sales', 12, 2)->default(0.00);
            $table->decimal('vat_amount', 12, 2)->default(0.00);
            $table->decimal('vat_relief_amount', 12, 2)->default(0.00);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->foreignId('discount_type_id')->nullable()->constrained('discount_types')->nullOnDelete();
            
            // Customer Details (Required for SC/PWD Discounts)
            $table->string('customer_name')->nullable();
            $table->string('customer_id_number', 100)->nullable();
            $table->string('customer_booklet_number', 100)->nullable();
            
            // Tender & Payment
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2);
            $table->decimal('change_amount', 12, 2)->default(0.00);
            $table->enum('payment_method', ['cash', 'gcash', 'maya', 'card'])->default('cash');
            $table->string('payment_reference', 100)->nullable();
            $table->enum('status', ['completed', 'cancelled', 'refunded'])->default('completed')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_batch_id')->nullable()->constrained('product_batches')->nullOnDelete();
            $table->foreignId('unit_of_measure_id')->constrained('units_of_measure');
            $table->integer('conversion_factor')->default(1);
            $table->integer('quantity');
            $table->integer('quantity_in_base_units');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            $table->boolean('is_vatable')->default(true);
            $table->boolean('sc_pwd_discountable')->default(true);
            $table->timestamps();
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->string('doctor_name');
            $table->string('doctor_license_no', 100);
            $table->string('doctor_ptr_no', 100)->nullable();
            $table->string('patient_name');
            $table->integer('patient_age')->nullable();
            $table->string('patient_address')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_batch_id')->nullable()->constrained('product_batches')->nullOnDelete();
            $table->foreignId('unit_of_measure_id')->nullable()->constrained('units_of_measure')->nullOnDelete();
            $table->enum('movement_type', ['sale', 'purchase_receiving', 'adjustment_in', 'adjustment_out', 'return', 'waste_expired'])->index();
            $table->decimal('quantity', 12, 2); // In transacted unit (e.g. 2 boxes)
            $table->decimal('quantity_in_base_units', 12, 2); // Positive or negative in base units
            $table->decimal('balance_before', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->string('reference_type', 50)->nullable(); // e.g. 'transaction', 'batch_receive'
            $table->string('reference_id', 50)->nullable(); // e.g. 'INV-20261122-0001'
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('held_carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->string('cart_reference');
            $table->json('cart_data');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('held_carts');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
    }
};
