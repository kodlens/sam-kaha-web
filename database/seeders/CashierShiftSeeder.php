<?php

namespace Database\Seeders;

use App\Models\CashierShift;
use App\Models\ShiftCashDrop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CashierShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cashier1 = User::where('email', 'cashier1@localhost')->first();
        $cashier2 = User::where('email', 'cashier2@localhost')->first();
        $cashier3 = User::where('email', 'cashier3@localhost')->first();
        $admin = User::where('email', 'admin@localhost')->first();

        if (! $cashier1) {
            return;
        }

        // Shift 1: Cashier 1 - Closed (Yesterday Morning) - Perfectly Balanced
        $yesterdayMorning = Carbon::yesterday()->setHour(8)->setMinute(0);
        $shift1 = CashierShift::create([
            'cashier_id' => $cashier1->id,
            'device_terminal_id' => 'TERM-01',
            'opening_float' => 2000.00,
            'cash_sales_total' => 14850.50,
            'non_cash_sales_total' => 4320.00,
            'cash_drops_total' => 10000.00,
            'expected_cash' => 6850.50, // 2000 + 14850.50 - 10000
            'closing_cash' => 6850.50,
            'cash_difference' => 0.00,
            'denomination_breakdown' => [
                '1000' => 5,
                '500' => 3,
                '200' => 1,
                '100' => 1,
                '50' => 1,
                '20' => 0,
                'coins' => 0.50,
            ],
            'status' => 'closed',
            'opened_at' => $yesterdayMorning,
            'closed_at' => $yesterdayMorning->copy()->addHours(8),
            'notes' => 'Normal morning shift. End of shift drawer count matched system expected cash exactly.',
        ]);

        ShiftCashDrop::create([
            'cashier_shift_id' => $shift1->id,
            'cashier_id' => $cashier1->id,
            'type' => 'drop_to_vault',
            'amount' => 10000.00,
            'reason' => 'Mid-day excess cash drop to manager vault',
            'authorized_by' => $admin?->id,
            'created_at' => $yesterdayMorning->copy()->addHours(4),
        ]);

        // Shift 2: Cashier 2 - Closed (Yesterday Afternoon) - Minor Shortage (-10 PHP)
        if ($cashier2) {
            $yesterdayAfternoon = Carbon::yesterday()->setHour(16)->setMinute(0);
            $shift2 = CashierShift::create([
                'cashier_id' => $cashier2->id,
                'device_terminal_id' => 'TERM-02',
                'opening_float' => 2000.00,
                'cash_sales_total' => 11240.00,
                'non_cash_sales_total' => 6800.00,
                'cash_drops_total' => 8000.00,
                'expected_cash' => 5240.00, // 2000 + 11240 - 8000
                'closing_cash' => 5230.00,
                'cash_difference' => -10.00,
                'denomination_breakdown' => [
                    '1000' => 4,
                    '500' => 2,
                    '200' => 1,
                    '100' => 0,
                    '50' => 0,
                    '20' => 1,
                    'coins' => 10.00,
                ],
                'status' => 'closed',
                'opened_at' => $yesterdayAfternoon,
                'closed_at' => $yesterdayAfternoon->copy()->addHours(8),
                'notes' => 'High rush during evening peak hours. ₱10 coins shortage acknowledged.',
            ]);

            ShiftCashDrop::create([
                'cashier_shift_id' => $shift2->id,
                'cashier_id' => $cashier2->id,
                'type' => 'drop_to_vault',
                'amount' => 8000.00,
                'reason' => 'Scheduled evening safe drop',
                'authorized_by' => $admin?->id,
                'created_at' => $yesterdayAfternoon->copy()->addHours(4),
            ]);
        }

        // Shift 3: Cashier 3 - Closed (2 days ago) - Minor Overage (+20 PHP)
        if ($cashier3) {
            $twoDaysAgo = Carbon::now()->subDays(2)->setHour(8)->setMinute(0);
            $shift3 = CashierShift::create([
                'cashier_id' => $cashier3->id,
                'device_terminal_id' => 'TERM-01',
                'opening_float' => 2500.00,
                'cash_sales_total' => 8450.00,
                'non_cash_sales_total' => 1900.00,
                'cash_drops_total' => 5000.00,
                'expected_cash' => 5950.00, // 2500 + 8450 - 5000
                'closing_cash' => 5970.00,
                'cash_difference' => 20.00,
                'denomination_breakdown' => [
                    '1000' => 4,
                    '500' => 3,
                    '200' => 2,
                    '100' => 0,
                    '50' => 1,
                    '20' => 1,
                    'coins' => 0.00,
                ],
                'status' => 'closed',
                'opened_at' => $twoDaysAgo,
                'closed_at' => $twoDaysAgo->copy()->addHours(8),
                'notes' => 'Customer did not wait for ₱20 change on OTC medicine purchase.',
            ]);

            ShiftCashDrop::create([
                'cashier_shift_id' => $shift3->id,
                'cashier_id' => $cashier3->id,
                'type' => 'drop_to_vault',
                'amount' => 5000.00,
                'reason' => 'Drop to safe',
                'authorized_by' => $admin?->id,
                'created_at' => $twoDaysAgo->copy()->addHours(5),
            ]);
        }

        // Shift 4: Cashier 1 - ACTIVE OPEN SHIFT TODAY
        $todayMorning = Carbon::today()->setHour(8)->setMinute(0);
        $shiftOpen = CashierShift::create([
            'cashier_id' => $cashier1->id,
            'device_terminal_id' => 'TERM-01',
            'opening_float' => 2500.00,
            'cash_sales_total' => 4680.00,
            'non_cash_sales_total' => 1250.00,
            'cash_drops_total' => 150.00,
            'expected_cash' => 7030.00, // 2500 + 4680 - 150
            'closing_cash' => null,
            'cash_difference' => null,
            'denomination_breakdown' => null,
            'status' => 'open',
            'opened_at' => $todayMorning,
            'closed_at' => null,
            'notes' => 'Active morning shift.',
        ]);

        ShiftCashDrop::create([
            'cashier_shift_id' => $shiftOpen->id,
            'cashier_id' => $cashier1->id,
            'type' => 'petty_cash_expense',
            'amount' => 150.00,
            'reason' => 'Emergency purchase of 3 rolls 80mm thermal receipt paper',
            'authorized_by' => $admin?->id,
            'created_at' => $todayMorning->copy()->addHours(2),
        ]);
    }
}
