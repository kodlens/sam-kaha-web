<?php

namespace Database\Seeders;

use App\Models\CashierShift;
use App\Models\DiscountType;
use App\Models\Prescription;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StatutoryDiscountLog;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Services\FefoInventoryService;
use App\Services\PhilippineDiscountService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cashier = User::where('email', 'cashier1@localhost')->first();
        if (! $cashier) {
            return;
        }

        $shift = CashierShift::where('cashier_id', $cashier->id)->latest('opened_at')->first();
        if (! $shift) {
            return;
        }

        Transaction::query()->delete();
        StockMovement::query()->delete();
        Prescription::query()->delete();

        $fefoService = new FefoInventoryService();
        $discountService = new PhilippineDiscountService();

        // -------------------------------------------------------------
        // Transaction 1: Regular Cash Sale (Biogesic Box + Safeguard Soap)
        // -------------------------------------------------------------
        $biogesic = Product::where('brand_name', 'Biogesic')->first();
        $safeguard = Product::where('brand_name', 'Safeguard Pure White Soap')->first();

        if ($biogesic && $safeguard) {
            $bioBoxUnit = $biogesic->units()->where('conversion_factor', 100)->first() ?? $biogesic->baseUnit;
            $safeguardBarUnit = $safeguard->baseUnit;

            $itemsData = [
                [
                    'product_id' => $biogesic->id,
                    'price' => (float) $bioBoxUnit->price,
                    'quantity' => 1,
                    'is_vatable' => (bool) $biogesic->is_vatable,
                    'sc_pwd_discountable' => (bool) $biogesic->sc_pwd_discountable,
                ],
                [
                    'product_id' => $safeguard->id,
                    'price' => (float) $safeguardBarUnit->price,
                    'quantity' => 2,
                    'is_vatable' => (bool) $safeguard->is_vatable,
                    'sc_pwd_discountable' => (bool) $safeguard->sc_pwd_discountable,
                ],
            ];

            $calc = $discountService->calculate($itemsData, 'NONE');

            $t1 = Transaction::create([
                'invoice_number' => 'INV-' . Carbon::today()->format('Ymd') . '-0001',
                'cashier_shift_id' => $shift->id,
                'cashier_id' => $cashier->id,
                'subtotal' => $calc['gross_total'],
                'vatable_sales' => $calc['vatable_sales'],
                'vat_exempt_sales' => $calc['vat_exempt_sales'],
                'vat_amount' => $calc['vat_amount'],
                'vat_relief_amount' => 0.00,
                'discount_amount' => 0.00,
                'discount_type_id' => null,
                'total_amount' => $calc['net_payable'],
                'paid_amount' => 1000.00,
                'change_amount' => 1000.00 - (float) $calc['net_payable'],
                'payment_method' => 'cash',
                'status' => 'completed',
                'created_at' => Carbon::now()->subHours(3),
            ]);

            // Deduct Biogesic (1 box = 100 pcs)
            $fefoService->deductFefo(
                product: $biogesic,
                quantityInBaseUnits: 100,
                uom: $bioBoxUnit->unitOfMeasure,
                transactedQty: 1,
                referenceId: $t1->invoice_number,
                user: $cashier
            );

            TransactionItem::create([
                'transaction_id' => $t1->id,
                'product_id' => $biogesic->id,
                'unit_of_measure_id' => $bioBoxUnit->unit_of_measure_id,
                'conversion_factor' => $bioBoxUnit->conversion_factor,
                'quantity' => 1,
                'quantity_in_base_units' => 100,
                'unit_price' => $bioBoxUnit->price,
                'subtotal' => $bioBoxUnit->price,
                'total_amount' => $bioBoxUnit->price,
                'is_vatable' => $biogesic->is_vatable,
                'sc_pwd_discountable' => $biogesic->sc_pwd_discountable,
            ]);

            // Deduct Safeguard (2 bars)
            $fefoService->deductFefo(
                product: $safeguard,
                quantityInBaseUnits: 2,
                uom: $safeguardBarUnit->unitOfMeasure,
                transactedQty: 2,
                referenceId: $t1->invoice_number,
                user: $cashier
            );

            TransactionItem::create([
                'transaction_id' => $t1->id,
                'product_id' => $safeguard->id,
                'unit_of_measure_id' => $safeguardBarUnit->unit_of_measure_id,
                'conversion_factor' => 1,
                'quantity' => 2,
                'quantity_in_base_units' => 2,
                'unit_price' => $safeguardBarUnit->price,
                'subtotal' => (float) $safeguardBarUnit->price * 2,
                'total_amount' => (float) $safeguardBarUnit->price * 2,
                'is_vatable' => $safeguard->is_vatable,
                'sc_pwd_discountable' => $safeguard->sc_pwd_discountable,
            ]);
        }

        // -------------------------------------------------------------
        // Transaction 2: Senior Citizen (RA 9994) + Doctor Rx Dispensing
        // -------------------------------------------------------------
        $cozaar = Product::where('brand_name', 'Cozaar')->first();
        $alnix = Product::where('brand_name', 'Alnix')->first();
        $scDiscount = DiscountType::where('code', 'SC')->first();

        if ($cozaar && $alnix && $scDiscount) {
            $cozaarBlisterUnit = $cozaar->units()->where('conversion_factor', 14)->first() ?? $cozaar->baseUnit;
            $alnixBlisterUnit = $alnix->units()->where('conversion_factor', 10)->first() ?? $alnix->baseUnit;

            $itemsData2 = [
                [
                    'product_id' => $cozaar->id,
                    'price' => (float) $cozaarBlisterUnit->price,
                    'quantity' => 1, // 1 blister pack (14 tabs)
                    'is_vatable' => (bool) $cozaar->is_vatable,
                    'sc_pwd_discountable' => (bool) $cozaar->sc_pwd_discountable,
                ],
                [
                    'product_id' => $alnix->id,
                    'price' => (float) $alnixBlisterUnit->price,
                    'quantity' => 1,
                    'is_vatable' => (bool) $alnix->is_vatable,
                    'sc_pwd_discountable' => (bool) $alnix->sc_pwd_discountable,
                ],
            ];

            $calc2 = $discountService->calculate($itemsData2, 'SC', 20.0);

            $t2 = Transaction::create([
                'invoice_number' => 'INV-' . Carbon::today()->format('Ymd') . '-0002',
                'cashier_shift_id' => $shift->id,
                'cashier_id' => $cashier->id,
                'subtotal' => $calc2['gross_total'],
                'vatable_sales' => $calc2['vatable_sales'],
                'vat_exempt_sales' => $calc2['vat_exempt_sales'],
                'vat_amount' => $calc2['vat_amount'],
                'vat_relief_amount' => $calc2['vat_relief_amount'],
                'discount_amount' => $calc2['discount_total'],
                'discount_type_id' => $scDiscount->id,
                'customer_name' => 'Lourdes Bautista',
                'customer_id_number' => 'OSCA-MNL-2023-77491',
                'customer_booklet_number' => 'BK-88392-2026',
                'total_amount' => $calc2['net_payable'],
                'paid_amount' => 1000.00,
                'change_amount' => 1000.00 - (float) $calc2['net_payable'],
                'payment_method' => 'cash',
                'status' => 'completed',
                'created_at' => Carbon::now()->subHours(1),
            ]);

            // Prescribing Doctor Details
            Prescription::create([
                'transaction_id' => $t2->id,
                'doctor_name' => 'Roberto Gomez, MD',
                'doctor_license_no' => 'PRC-0084729',
                'doctor_ptr_no' => 'PTR-9840281-MNL',
                'patient_name' => 'Lourdes Bautista',
                'patient_age' => 68,
                'patient_address' => 'Sampaloc, Manila',
            ]);

            // Deduct Cozaar (1 blister = 14 pcs)
            $fefoService->deductFefo(
                product: $cozaar,
                quantityInBaseUnits: 14,
                uom: $cozaarBlisterUnit->unitOfMeasure,
                transactedQty: 1,
                referenceId: $t2->invoice_number,
                user: $cashier
            );

            TransactionItem::create([
                'transaction_id' => $t2->id,
                'product_id' => $cozaar->id,
                'unit_of_measure_id' => $cozaarBlisterUnit->unit_of_measure_id,
                'conversion_factor' => 14,
                'quantity' => 1,
                'quantity_in_base_units' => 14,
                'unit_price' => $cozaarBlisterUnit->price,
                'subtotal' => $cozaarBlisterUnit->price,
                'total_amount' => $cozaarBlisterUnit->price,
                'is_vatable' => $cozaar->is_vatable,
                'sc_pwd_discountable' => $cozaar->sc_pwd_discountable,
            ]);

            // Deduct Alnix (1 blister = 10 pcs)
            $fefoService->deductFefo(
                product: $alnix,
                quantityInBaseUnits: 10,
                uom: $alnixBlisterUnit->unitOfMeasure,
                transactedQty: 1,
                referenceId: $t2->invoice_number,
                user: $cashier
            );

            TransactionItem::create([
                'transaction_id' => $t2->id,
                'product_id' => $alnix->id,
                'unit_of_measure_id' => $alnixBlisterUnit->unit_of_measure_id,
                'conversion_factor' => 10,
                'quantity' => 1,
                'quantity_in_base_units' => 10,
                'unit_price' => $alnixBlisterUnit->price,
                'subtotal' => $alnixBlisterUnit->price,
                'total_amount' => $alnixBlisterUnit->price,
                'is_vatable' => $alnix->is_vatable,
                'sc_pwd_discountable' => $alnix->sc_pwd_discountable,
            ]);

            // Log BIR Statutory discount
            StatutoryDiscountLog::create([
                'discount_type_id' => $scDiscount->id,
                'customer_name' => 'Lourdes Bautista',
                'id_number' => 'OSCA-MNL-2023-77491',
                'booklet_number' => 'BK-88392-2026',
                'gross_amount' => $calc2['gross_total'],
                'vat_exempt_amount' => $calc2['vat_exempt_sales'],
                'vat_relief_amount' => $calc2['vat_relief_amount'],
                'discount_amount' => $calc2['discount_total'],
                'net_amount' => $calc2['net_payable'],
                'cashier_name' => $cashier->name,
                'cashier_id' => $cashier->id,
                'recorded_at' => Carbon::now()->subHours(1),
            ]);
        }
    }
}
