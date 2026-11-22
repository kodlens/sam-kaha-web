<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UnitOfMeasureController;
use App\Http\Controllers\Cashier\PosController;
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

        // Module 3: Medicine & Product Masterfile
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::patch('/products/{product}/toggle', [ProductController::class, 'toggleStatus'])->name('products.toggle');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // Cashier module routes
    Route::prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos');
    });
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
