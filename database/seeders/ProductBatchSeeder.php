<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProductBatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $productMap = Product::pluck('id', 'sku')->toArray();

        $batches = [
            // Biogesic - 1 near expiry (35 days), 1 healthy (18 months)
            [
                'sku' => 'BIO-500-TAB',
                'batch_number' => 'LOT-BIO-25A',
                'expiry_date' => $now->copy()->addDays(35)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(18)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(17)->format('Y-m-d'),
                'quantity_received' => 300,
                'quantity_remaining' => 140,
                'unit_cost' => 5.20,
                'supplier_name' => 'United Laboratories (Unilab)',
                'supplier_invoice_no' => 'INV-ULB-88910',
                'status' => 'near_expiry',
                'notes' => 'Priority dispensing (FEFO) - expires in 35 days.',
            ],
            [
                'sku' => 'BIO-500-TAB',
                'batch_number' => 'LOT-BIO-26C',
                'expiry_date' => $now->copy()->addMonths(20)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(2)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'quantity_received' => 1000,
                'quantity_remaining' => 1000,
                'unit_cost' => 5.20,
                'supplier_name' => 'United Laboratories (Unilab)',
                'supplier_invoice_no' => 'INV-ULB-94301',
                'status' => 'active',
                'notes' => 'New delivery, stored in Main Bay A-1.',
            ],

            // Amoxil - Healthy active batch
            [
                'sku' => 'AMX-500-CAP',
                'batch_number' => 'LOT-AMX-2601',
                'expiry_date' => $now->copy()->addMonths(15)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(3)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(2)->format('Y-m-d'),
                'quantity_received' => 500,
                'quantity_remaining' => 450,
                'unit_cost' => 9.50,
                'supplier_name' => 'Zuellig Pharma Philippines',
                'supplier_invoice_no' => 'INV-ZLG-33109',
                'status' => 'active',
                'notes' => 'Rx antibiotic stock.',
            ],

            // Ponstan - 1 expired batch (for quarantine demo), 1 active batch
            [
                'sku' => 'PON-500-TAB',
                'batch_number' => 'LOT-PON-24X',
                'expiry_date' => $now->copy()->subDays(12)->format('Y-m-d'), // EXPIRED!
                'manufacturing_date' => $now->copy()->subMonths(24)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(23)->format('Y-m-d'),
                'quantity_received' => 200,
                'quantity_remaining' => 35,
                'unit_cost' => 16.00,
                'supplier_name' => 'Zuellig Pharma Philippines',
                'supplier_invoice_no' => 'INV-ZLG-22019',
                'status' => 'expired',
                'notes' => 'EXPIRED - Quarantined in Return Bin. Prohibited from dispensing.',
            ],
            [
                'sku' => 'PON-500-TAB',
                'batch_number' => 'LOT-PON-26B',
                'expiry_date' => $now->copy()->addMonths(18)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'received_date' => $now->copy()->subDays(15)->format('Y-m-d'),
                'quantity_received' => 400,
                'quantity_remaining' => 380,
                'unit_cost' => 16.00,
                'supplier_name' => 'Zuellig Pharma Philippines',
                'supplier_invoice_no' => 'INV-ZLG-44021',
                'status' => 'active',
                'notes' => 'Fresh stock.',
            ],

            // Cozaar (Losartan) - Active batch
            [
                'sku' => 'COZ-50-TAB',
                'batch_number' => 'LOT-COZ-9921',
                'expiry_date' => $now->copy()->addMonths(22)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(2)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'quantity_received' => 280,
                'quantity_remaining' => 240,
                'unit_cost' => 22.00,
                'supplier_name' => 'Metro Drug Inc.',
                'supplier_invoice_no' => 'INV-MDI-77123',
                'status' => 'active',
                'notes' => 'Hypertension prescription medicine (VAT-Exempt).',
            ],

            // Glucophage (Metformin) - 1 Urgent Near Expiry (18 days), 1 active batch
            [
                'sku' => 'GLU-500-TAB',
                'batch_number' => 'LOT-GLU-25A',
                'expiry_date' => $now->copy()->addDays(18)->format('Y-m-d'), // URGENT NEAR EXPIRY!
                'manufacturing_date' => $now->copy()->subMonths(20)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(19)->format('Y-m-d'),
                'quantity_received' => 300,
                'quantity_remaining' => 45,
                'unit_cost' => 11.00,
                'supplier_name' => 'Metro Drug Inc.',
                'supplier_invoice_no' => 'INV-MDI-66104',
                'status' => 'near_expiry',
                'notes' => 'Urgent: 18 days left. Dispense before next lot.',
            ],
            [
                'sku' => 'GLU-500-TAB',
                'batch_number' => 'LOT-GLU-26B',
                'expiry_date' => $now->copy()->addMonths(24)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'received_date' => $now->copy()->subDays(10)->format('Y-m-d'),
                'quantity_received' => 600,
                'quantity_remaining' => 600,
                'unit_cost' => 11.00,
                'supplier_name' => 'Metro Drug Inc.',
                'supplier_invoice_no' => 'INV-MDI-79011',
                'status' => 'active',
                'notes' => 'Full carton in reserve.',
            ],

            // Safeguard Soap - Active
            [
                'sku' => 'SAF-WHT-135G',
                'batch_number' => 'LOT-SAF-001',
                'expiry_date' => $now->copy()->addMonths(36)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'received_date' => $now->copy()->subDays(20)->format('Y-m-d'),
                'quantity_received' => 120,
                'quantity_remaining' => 96,
                'unit_cost' => 38.00,
                'supplier_name' => 'Procter & Gamble Philippines',
                'supplier_invoice_no' => 'INV-PG-10029',
                'status' => 'active',
                'notes' => 'Grocery toiletries.',
            ],

            // Nature's Spring Water - Active
            [
                'sku' => 'NAT-SPR-500ML',
                'batch_number' => 'LOT-WAT-2611',
                'expiry_date' => $now->copy()->addMonths(12)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subDays(15)->format('Y-m-d'),
                'received_date' => $now->copy()->subDays(10)->format('Y-m-d'),
                'quantity_received' => 144,
                'quantity_remaining' => 120,
                'unit_cost' => 9.50,
                'supplier_name' => 'Philippine Spring Water Resources Inc.',
                'supplier_invoice_no' => 'INV-PSW-45129',
                'status' => 'active',
                'notes' => 'Chiller and front shelf.',
            ],

            // PediaSure - Warning near expiry (65 days)
            [
                'sku' => 'PED-PLUS-850G',
                'batch_number' => 'LOT-PED-25K',
                'expiry_date' => $now->copy()->addDays(65)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(16)->format('Y-m-d'),
                'received_date' => $now->copy()->subMonths(14)->format('Y-m-d'),
                'quantity_received' => 24,
                'quantity_remaining' => 8,
                'unit_cost' => 1120.00,
                'supplier_name' => 'Abbott Laboratories Philippines',
                'supplier_invoice_no' => 'INV-ABT-99014',
                'status' => 'near_expiry',
                'notes' => 'Expiring in ~2 months. Monitor turnover.',
            ],

            // Green Cross Alcohol - Active
            [
                'sku' => 'GRN-ALC-500ML',
                'batch_number' => 'LOT-ALC-778',
                'expiry_date' => $now->copy()->addMonths(24)->format('Y-m-d'),
                'manufacturing_date' => $now->copy()->subMonths(1)->format('Y-m-d'),
                'received_date' => $now->copy()->subDays(12)->format('Y-m-d'),
                'quantity_received' => 60,
                'quantity_remaining' => 52,
                'unit_cost' => 68.00,
                'supplier_name' => 'Green Cross Incorporated',
                'supplier_invoice_no' => 'INV-GCI-88201',
                'status' => 'active',
                'notes' => 'Medical supply antiseptic.',
            ],
        ];

        foreach ($batches as $batchData) {
            $sku = $batchData['sku'];
            unset($batchData['sku']);

            if (isset($productMap[$sku])) {
                $batchData['product_id'] = $productMap[$sku];
                ProductBatch::updateOrCreate(
                    [
                        'product_id' => $batchData['product_id'],
                        'batch_number' => $batchData['batch_number'],
                    ],
                    $batchData
                );
            }
        }
    }
}
