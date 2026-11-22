<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Display the POS terminal.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeShift = $user->activeShift();

        if ($activeShift) {
            $activeShift->load(['cashDrops']);
        }

        return Inertia::render('cashier/pos', [
            'cashier' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'shift' => $activeShift,
        ]);
    }
}
