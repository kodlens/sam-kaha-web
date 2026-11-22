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
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->string('device_terminal_id', 50)->default('TERM-01');
            $table->decimal('opening_float', 12, 2)->default(0.00);
            $table->decimal('cash_sales_total', 12, 2)->default(0.00);
            $table->decimal('non_cash_sales_total', 12, 2)->default(0.00);
            $table->decimal('cash_drops_total', 12, 2)->default(0.00);
            $table->decimal('expected_cash', 12, 2)->nullable();
            $table->decimal('closing_cash', 12, 2)->nullable();
            $table->decimal('cash_difference', 12, 2)->nullable();
            $table->json('denomination_breakdown')->nullable();
            $table->enum('status', ['open', 'closed'])->default('open')->index();
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('shift_cash_drops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_shift_id')->constrained('cashier_shifts')->cascadeOnDelete();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['drop_to_vault', 'petty_cash_expense', 'float_replenishment'])->default('drop_to_vault');
            $table->decimal('amount', 12, 2);
            $table->string('reason');
            $table->foreignId('authorized_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_cash_drops');
        Schema::dropIfExists('cashier_shifts');
    }
};
