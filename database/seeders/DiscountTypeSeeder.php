<?php

namespace Database\Seeders;

use App\Models\DiscountType;
use App\Models\StatutoryDiscountLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DiscountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discountTypes = [
            [
                'name' => 'Senior Citizen Discount (RA 9994)',
                'code' => 'SC',
                'percentage' => 20.00,
                'is_vat_exempt' => true,
                'requires_id' => true,
                'requires_booklet' => true,
                'applies_to' => 'medicines_and_supplies',
                'is_statutory' => true,
                'legal_basis' => 'Republic Act No. 9994 (Expanded Senior Citizens Act of 2010)',
                'description' => '20% discount and 12% VAT exemption on prescription & essential medicines for Filipino citizens aged 60 and above.',
                'is_active' => true,
            ],
            [
                'name' => 'Person with Disability Discount (RA 10754)',
                'code' => 'PWD',
                'percentage' => 20.00,
                'is_vat_exempt' => true,
                'requires_id' => true,
                'requires_booklet' => true,
                'applies_to' => 'medicines_and_supplies',
                'is_statutory' => true,
                'legal_basis' => 'Republic Act No. 10754 (An Act Expanding the Benefits and Privileges of PWDs)',
                'description' => '20% discount and 12% VAT exemption on medicines and medical supplies for registered persons with disability.',
                'is_active' => true,
            ],
            [
                'name' => 'National Athletes & Coaches (RA 10699)',
                'code' => 'ATHLETE',
                'percentage' => 20.00,
                'is_vat_exempt' => false,
                'requires_id' => true,
                'requires_booklet' => false,
                'applies_to' => 'medicines_and_supplies',
                'is_statutory' => true,
                'legal_basis' => 'Republic Act No. 10699 (National Athletes and Coaches Benefits and Incentives Act)',
                'description' => '20% discount on medicines and sports supplies for officially accredited national athletes.',
                'is_active' => true,
            ],
            [
                'name' => 'Solo Parent Discount (RA 11861)',
                'code' => 'SOLO_PARENT',
                'percentage' => 10.00,
                'is_vat_exempt' => true,
                'requires_id' => true,
                'requires_booklet' => false,
                'applies_to' => 'all',
                'is_statutory' => true,
                'legal_basis' => 'Republic Act No. 11861 (Expanded Solo Parents Welfare Act)',
                'description' => '10% discount and VAT exemption on baby milk, food supplements, and medicines for children up to 6 years old.',
                'is_active' => true,
            ],
            [
                'name' => 'Employee & Staff Privilege',
                'code' => 'STAFF',
                'percentage' => 10.00,
                'is_vat_exempt' => false,
                'requires_id' => false,
                'requires_booklet' => false,
                'applies_to' => 'all',
                'is_statutory' => false,
                'legal_basis' => 'Internal Pharmacy Benefit Policy',
                'description' => 'Company staff privilege discount on medicines and personal care items.',
                'is_active' => true,
            ],
            [
                'name' => 'Store Promotional Discount',
                'code' => 'PROMO',
                'percentage' => 5.00,
                'is_vat_exempt' => false,
                'requires_id' => false,
                'requires_booklet' => false,
                'applies_to' => 'all',
                'is_statutory' => false,
                'legal_basis' => 'Marketing Campaign',
                'description' => 'Seasonal holiday or loyalty discount.',
                'is_active' => true,
            ],
        ];

        foreach ($discountTypes as $dt) {
            DiscountType::updateOrCreate(['code' => $dt['code']], $dt);
        }

        $scType = DiscountType::where('code', 'SC')->first();
        $pwdType = DiscountType::where('code', 'PWD')->first();
        $cashier = User::where('role', 'cashier')->first();

        // Seed sample BIR audit logs
        if ($scType && $pwdType) {
            $now = Carbon::now();

            $logs = [
                [
                    'discount_type_id' => $scType->id,
                    'customer_name' => 'Eduardo Santos Ramos',
                    'id_number' => 'OSCA-QC-2022-09812',
                    'booklet_number' => 'BK-NCR-77812',
                    'gross_amount' => 1250.00,
                    'vat_exempt_amount' => 1116.07,
                    'vat_relief_amount' => 133.93,
                    'discount_amount' => 223.21,
                    'net_amount' => 892.86,
                    'cashier_name' => $cashier?->name ?? 'Grace Villanueva',
                    'cashier_id' => $cashier?->id,
                    'recorded_at' => $now->copy()->subHours(2),
                ],
                [
                    'discount_type_id' => $scType->id,
                    'customer_name' => 'Corazon Aquino Dela Cruz',
                    'id_number' => 'OSCA-MNL-2021-44512',
                    'booklet_number' => 'BK-MNL-33412',
                    'gross_amount' => 840.00,
                    'vat_exempt_amount' => 750.00,
                    'vat_relief_amount' => 90.00,
                    'discount_amount' => 150.00,
                    'net_amount' => 600.00,
                    'cashier_name' => $cashier?->name ?? 'Grace Villanueva',
                    'cashier_id' => $cashier?->id,
                    'recorded_at' => $now->copy()->subHours(5),
                ],
                [
                    'discount_type_id' => $pwdType->id,
                    'customer_name' => 'Mark Joseph Bautista',
                    'id_number' => 'PWD-MAK-2023-11209',
                    'booklet_number' => 'BK-MAK-88912',
                    'gross_amount' => 650.00,
                    'vat_exempt_amount' => 580.36,
                    'vat_relief_amount' => 69.64,
                    'discount_amount' => 116.07,
                    'net_amount' => 464.29,
                    'cashier_name' => $cashier?->name ?? 'Grace Villanueva',
                    'cashier_id' => $cashier?->id,
                    'recorded_at' => $now->copy()->subDays(1),
                ],
                [
                    'discount_type_id' => $scType->id,
                    'customer_name' => 'Vicente Garcia Tan',
                    'id_number' => 'OSCA-CEB-2020-55123',
                    'booklet_number' => 'BK-CEB-12903',
                    'gross_amount' => 2100.00,
                    'vat_exempt_amount' => 1875.00,
                    'vat_relief_amount' => 225.00,
                    'discount_amount' => 375.00,
                    'net_amount' => 1500.00,
                    'cashier_name' => $cashier?->name ?? 'Grace Villanueva',
                    'cashier_id' => $cashier?->id,
                    'recorded_at' => $now->copy()->subDays(2),
                ],
            ];

            foreach ($logs as $log) {
                StatutoryDiscountLog::create($log);
            }
        }
    }
}
