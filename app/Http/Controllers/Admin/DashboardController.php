<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalCashiers' => User::where('role', 'cashier')->count(),
                'totalProducts' => Product::count(),
                'nearExpiryCount' => ProductBatch::nearExpiry(90)->count(),
                'todaySales' => 0.00,
            ],
            'recentShifts' => [],
        ]);
    }
}
