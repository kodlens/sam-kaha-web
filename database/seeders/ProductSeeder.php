<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $uomMap = UnitOfMeasure::pluck('id', 'name')->toArray();

        $pieceId = $uomMap['Piece / Tablet'] ?? 1;
        $capsuleId = $uomMap['Capsule'] ?? 2;
        $blisterId = $uomMap['Blister Pack'] ?? 3;
        $stripId = $uomMap['Strip'] ?? 4;
        $boxId = $uomMap['Box'] ?? 5;
        $bottleId = $uomMap['Bottle'] ?? 6;
        $nebuleId = $uomMap['Nebule'] ?? 9;

        $products = [
            [
                'brand_name' => 'Biogesic',
                'generic_name' => 'Paracetamol',
                'dosage_strength' => '500mg',
                'dosage_form' => 'Tablet',
                'category' => 'Analgesic / Antipyretic',
                'sku' => 'BIO-500-TAB',
                'barcode' => '4800016644109',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'reorder_level' => 50,
                'storage_conditions' => 'Store at temperatures not exceeding 30°C',
                'description' => 'For the relief of minor aches and fever',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 8.50, 'cost' => 5.20, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 10, 'price' => 80.00, 'cost' => 52.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 100, 'price' => 750.00, 'cost' => 500.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Amoxil',
                'generic_name' => 'Amoxicillin (as trihydrate)',
                'dosage_strength' => '500mg',
                'dosage_form' => 'Capsule',
                'category' => 'Antibacterial',
                'sku' => 'AMX-500-CAP',
                'barcode' => '4800016644208',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => true,
                'reorder_level' => 30,
                'storage_conditions' => 'Store in a dry place below 25°C',
                'description' => 'Broad-spectrum penicillin antibiotic',
                'units' => [
                    ['uom_id' => $capsuleId, 'factor' => 1, 'price' => 16.00, 'cost' => 9.50, 'is_base' => true],
                    ['uom_id' => $stripId, 'factor' => 10, 'price' => 150.00, 'cost' => 95.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 100, 'price' => 1400.00, 'cost' => 900.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Ponstan',
                'generic_name' => 'Mefenamic Acid',
                'dosage_strength' => '500mg',
                'dosage_form' => 'Tablet',
                'category' => 'Analgesic / Anti-inflammatory',
                'sku' => 'PON-500-TAB',
                'barcode' => '4800016644307',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => true,
                'reorder_level' => 25,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'For acute dental pain, dysmenorrhea, and inflammatory disorders',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 24.00, 'cost' => 16.00, 'is_base' => true],
                    ['uom_id' => $stripId, 'factor' => 10, 'price' => 225.00, 'cost' => 160.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 100, 'price' => 2100.00, 'cost' => 1500.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Alnix',
                'generic_name' => 'Cetirizine Dihydrochloride',
                'dosage_strength' => '10mg',
                'dosage_form' => 'Tablet',
                'category' => 'Antihistamine',
                'sku' => 'ALN-10-TAB',
                'barcode' => '4800016644406',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'reorder_level' => 20,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Non-sedating antihistamine for allergic rhinitis and urticaria',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 28.00, 'cost' => 18.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 10, 'price' => 260.00, 'cost' => 180.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 50, 'price' => 1250.00, 'cost' => 850.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Cozaar',
                'generic_name' => 'Losartan Potassium',
                'dosage_strength' => '50mg',
                'dosage_form' => 'Tablet',
                'category' => 'Antihypertensive',
                'sku' => 'COZ-50-TAB',
                'barcode' => '4800016644505',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => false, // PH FDA VAT-Exempt for Hypertension
                'reorder_level' => 30,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Angiotensin II receptor antagonist (VAT-Exempt per RA 10963)',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 32.00, 'cost' => 22.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 14, 'price' => 430.00, 'cost' => 300.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 28, 'price' => 820.00, 'cost' => 580.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Glucophage',
                'generic_name' => 'Metformin Hydrochloride',
                'dosage_strength' => '500mg',
                'dosage_form' => 'Tablet',
                'category' => 'Antidiabetic',
                'sku' => 'GLU-500-TAB',
                'barcode' => '4800016644604',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => false, // PH FDA VAT-Exempt for Diabetes
                'reorder_level' => 40,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Biguanide antidiabetic medication (VAT-Exempt per RA 10963)',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 18.00, 'cost' => 11.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 10, 'price' => 170.00, 'cost' => 110.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 100, 'price' => 1600.00, 'cost' => 1050.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Ventolin',
                'generic_name' => 'Salbutamol Sulfate',
                'dosage_strength' => '2.5mg / 2.5ml',
                'dosage_form' => 'Nebule',
                'category' => 'Bronchodilator',
                'sku' => 'VEN-2.5-NEB',
                'barcode' => '4800016644703',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => true,
                'reorder_level' => 30,
                'storage_conditions' => 'Store below 30°C. Protect from light.',
                'description' => 'For acute management of bronchospasm in asthma and COPD',
                'units' => [
                    ['uom_id' => $nebuleId, 'factor' => 1, 'price' => 42.00, 'cost' => 28.00, 'is_base' => true],
                    ['uom_id' => $boxId, 'factor' => 30, 'price' => 1150.00, 'cost' => 800.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Tempra',
                'generic_name' => 'Paracetamol',
                'dosage_strength' => '120mg / 5ml (60ml)',
                'dosage_form' => 'Syrup',
                'category' => 'Pediatric Antipyretic',
                'sku' => 'TMP-120-SYR',
                'barcode' => '4800016644802',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'reorder_level' => 15,
                'storage_conditions' => 'Store at temperatures not exceeding 30°C',
                'description' => 'Pediatric strawberry-flavored syrup for fever relief',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 168.00, 'cost' => 120.00, 'is_base' => true],
                    ['uom_id' => $boxId, 'factor' => 12, 'price' => 1920.00, 'cost' => 1380.00, 'is_base' => false],
                ],
            ],
            [
                'brand_name' => 'Ceelin Plus',
                'generic_name' => 'Ascorbic Acid + Zinc',
                'dosage_strength' => '100mg / 10mg per 5ml (120ml)',
                'dosage_form' => 'Syrup',
                'category' => 'Vitamins & Supplements',
                'sku' => 'CEE-PLUS-120',
                'barcode' => '4800016644901',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'reorder_level' => 20,
                'storage_conditions' => 'Store at temperatures not exceeding 30°C',
                'description' => 'Daily nutritional support for immune defense in children',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 220.00, 'cost' => 160.00, 'is_base' => true],
                ],
            ],
            [
                'brand_name' => 'Betadine',
                'generic_name' => 'Povidone Iodine',
                'dosage_strength' => '10% (60ml)',
                'dosage_form' => 'Solution',
                'category' => 'Topical Antiseptic',
                'sku' => 'BET-10-60ML',
                'barcode' => '4800016645007',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'reorder_level' => 15,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Broad-spectrum germicide for wound disinfection',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 190.00, 'cost' => 135.00, 'is_base' => true],
                ],
            ],
        ];

        foreach ($products as $prodData) {
            $units = $prodData['units'];
            unset($prodData['units']);

            $product = Product::updateOrCreate(
                ['sku' => $prodData['sku']],
                $prodData
            );

            foreach ($units as $unitData) {
                ProductUnit::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'unit_of_measure_id' => $unitData['uom_id'],
                    ],
                    [
                        'conversion_factor' => $unitData['factor'],
                        'price' => $unitData['price'],
                        'cost' => $unitData['cost'],
                        'is_base_unit' => $unitData['is_base'],
                    ]
                );
            }
        }
    }
}
