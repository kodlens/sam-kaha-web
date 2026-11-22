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
        Schema::create('discount_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 30)->unique();
            $table->decimal('percentage', 5, 2)->default(20.00);
            $table->boolean('is_vat_exempt')->default(false); // True for RA 9994 (SC) & RA 10754 (PWD) on meds
            $table->boolean('requires_id')->default(false);
            $table->boolean('requires_booklet')->default(false);
            $table->enum('applies_to', ['medicines_and_supplies', 'all', 'groceries_only'])->default('medicines_and_supplies');
            $table->boolean('is_statutory')->default(false); // Philippine laws (cannot be deleted)
            $table->text('legal_basis')->nullable(); // e.g. "Republic Act No. 9994 / Expanded Senior Citizens Act of 2010"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('statutory_discount_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discount_type_id')->constrained('discount_types')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('id_number'); // OSCA ID, PWD ID, etc.
            $table->string('booklet_number')->nullable(); // Purchase Booklet Control Number
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('vat_exempt_amount', 10, 2)->default(0);
            $table->decimal('vat_relief_amount', 10, 2)->default(0); // 12% VAT waived
            $table->decimal('discount_amount', 10, 2); // 20% Discount
            $table->decimal('net_amount', 10, 2);
            $table->string('cashier_name')->nullable();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index(['discount_type_id', 'recorded_at']);
            $table->index('id_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statutory_discount_logs');
        Schema::dropIfExists('discount_types');
    }
};
