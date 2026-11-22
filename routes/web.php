<?php

use App\Http\Controllers\Admin\BatchController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShiftAuditController;
use App\Http\Controllers\Admin\UnitOfMeasureController;
use App\Http\Controllers\Cashier\PosController;
use App\Http\Controllers\Cashier\ShiftController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Role-based destination redirect
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('cashier.pos');
    })->name('dashboard');

    // Admin module routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Module 2: Unit of Measure (UOM)
        Route::get('/uom', [UnitOfMeasureController::class, 'index'])->name('uom.index');
        Route::post('/uom', [UnitOfMeasureController::class, 'store'])->name('uom.store');
        Route::put('/uom/{uom}', [UnitOfMeasureController::class, 'update'])->name('uom.update');
        Route::patch('/uom/{uom}/toggle', [UnitOfMeasureController::class, 'toggleStatus'])->name('uom.toggle');
        Route::delete('/uom/{uom}', [UnitOfMeasureController::class, 'destroy'])->name('uom.destroy');

        // Module 3: Product Masterlist
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::post('/products/{product}/stock-update', [ProductController::class, 'quickUpdateStock'])->name('products.stock-update');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::patch('/products/{product}/toggle', [ProductController::class, 'toggleStatus'])->name('products.toggle');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Module 4: Batches & Expiry (FEFO)
        Route::get('/batches', [BatchController::class, 'index'])->name('batches.index');
        Route::post('/batches', [BatchController::class, 'store'])->name('batches.store');
        Route::put('/batches/{batch}', [BatchController::class, 'update'])->name('batches.update');
        Route::patch('/batches/{batch}/quarantine', [BatchController::class, 'quarantine'])->name('batches.quarantine');
        Route::post('/batches/{batch}/adjust', [BatchController::class, 'adjustStock'])->name('batches.adjust');

        // Module 5: Discounts & Philippine Statutory Benefits
        Route::get('/discounts', [DiscountController::class, 'index'])->name('discounts.index');
        Route::post('/discounts', [DiscountController::class, 'store'])->name('discounts.store');
        Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discounts.update');
        Route::patch('/discounts/{discount}/toggle', [DiscountController::class, 'toggleStatus'])->name('discounts.toggle');

        // Module 6: Cashier Shifts & Cash Drawer Audit
        Route::get('/shifts', [ShiftAuditController::class, 'index'])->name('shifts.index');
        Route::post('/shifts/{shift}/force-close', [ShiftAuditController::class, 'forceClose'])->name('shifts.force-close');
    });

    // Cashier module routes
    Route::prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos');
        Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');
        Route::post('/pos/hold-cart', [PosController::class, 'holdCart'])->name('pos.hold-cart');
        Route::delete('/pos/held-cart/{heldCart}', [PosController::class, 'deleteHeldCart'])->name('pos.delete-held-cart');

        // Shift management
        Route::post('/shifts/open', [ShiftController::class, 'store'])->name('shifts.open');
        Route::post('/shifts/{shift}/drop', [ShiftController::class, 'cashDrop'])->name('shifts.drop');
        Route::post('/shifts/{shift}/close', [ShiftController::class, 'close'])->name('shifts.close');
        Route::get('/shifts/{shift}/reading', [ShiftController::class, 'reading'])->name('shifts.reading');
    });
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
