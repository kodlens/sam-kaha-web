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
        $tubeId = $uomMap['Tube'] ?? 8;
        $barId = $uomMap['Bar'] ?? 9;
        $canId = $uomMap['Can / Tin'] ?? 10;
        $packId = $uomMap['Pack / Roll'] ?? 11;
        $nebuleId = $uomMap['Nebule'] ?? 12;

        $products = [
            // ==================== MEDICINES ====================
            [
                'product_type' => 'medicine',
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
                'sc_pwd_discountable' => true,
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
                'product_type' => 'medicine',
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
                'sc_pwd_discountable' => true,
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
                'product_type' => 'medicine',
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
                'sc_pwd_discountable' => true,
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
                'product_type' => 'medicine',
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
                'sc_pwd_discountable' => true,
                'reorder_level' => 20,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Non-sedating antihistamine for allergic rhinitis',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 28.00, 'cost' => 18.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 10, 'price' => 260.00, 'cost' => 180.00, 'is_base' => false],
                ],
            ],
            [
                'product_type' => 'medicine',
                'brand_name' => 'Cozaar',
                'generic_name' => 'Losartan Potassium',
                'dosage_strength' => '50mg',
                'dosage_form' => 'Tablet',
                'category' => 'Antihypertensive',
                'sku' => 'COZ-50-TAB',
                'barcode' => '4800016644505',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => false, // PH FDA VAT-Exempt for Hypertension per RA 10963
                'sc_pwd_discountable' => true,
                'reorder_level' => 30,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Angiotensin II receptor antagonist (VAT-Exempt)',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 32.00, 'cost' => 22.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 14, 'price' => 430.00, 'cost' => 300.00, 'is_base' => false],
                    ['uom_id' => $boxId, 'factor' => 28, 'price' => 820.00, 'cost' => 580.00, 'is_base' => false],
                ],
            ],
            [
                'product_type' => 'medicine',
                'brand_name' => 'Glucophage',
                'generic_name' => 'Metformin Hydrochloride',
                'dosage_strength' => '500mg',
                'dosage_form' => 'Tablet',
                'category' => 'Antidiabetic',
                'sku' => 'GLU-500-TAB',
                'barcode' => '4800016644604',
                'classification' => 'prescription',
                'requires_prescription' => true,
                'is_vatable' => false, // PH FDA VAT-Exempt for Diabetes per RA 10963
                'sc_pwd_discountable' => true,
                'reorder_level' => 40,
                'storage_conditions' => 'Store below 30°C',
                'description' => 'Biguanide antidiabetic medication (VAT-Exempt)',
                'units' => [
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 18.00, 'cost' => 11.00, 'is_base' => true],
                    ['uom_id' => $blisterId, 'factor' => 10, 'price' => 170.00, 'cost' => 110.00, 'is_base' => false],
                ],
            ],
            [
                'product_type' => 'medicine',
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
                'sc_pwd_discountable' => true,
                'reorder_level' => 15,
                'storage_conditions' => 'Store at temperatures not exceeding 30°C',
                'description' => 'Pediatric strawberry-flavored syrup for fever relief',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 168.00, 'cost' => 120.00, 'is_base' => true],
                ],
            ],

            // ==================== GROCERY & PERSONAL CARE ====================
            [
                'product_type' => 'grocery',
                'brand_name' => 'Safeguard Pure White Soap',
                'generic_name' => null,
                'dosage_strength' => '135g',
                'dosage_form' => 'Bar',
                'category' => 'Toiletries & Hygiene',
                'sku' => 'SAF-WHT-135G',
                'barcode' => '4902430123456',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false, // Groceries NOT eligible for 20% medicine discount
                'reorder_level' => 20,
                'storage_conditions' => 'Store in a cool dry place',
                'description' => 'Germicidal antibacterial bath bar soap',
                'units' => [
                    ['uom_id' => $barId, 'factor' => 1, 'price' => 52.00, 'cost' => 38.00, 'is_base' => true],
                    ['uom_id' => $packId, 'factor' => 3, 'price' => 150.00, 'cost' => 110.00, 'is_base' => false],
                ],
            ],
            [
                'product_type' => 'grocery',
                'brand_name' => 'Colgate Total Clean Mint Toothpaste',
                'generic_name' => null,
                'dosage_strength' => '150g',
                'dosage_form' => 'Tube',
                'category' => 'Oral Care',
                'sku' => 'COL-TOT-150G',
                'barcode' => '8850006321456',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false,
                'reorder_level' => 15,
                'storage_conditions' => 'Store at room temperature',
                'description' => 'Antibacterial fluoride toothpaste for whole mouth health',
                'units' => [
                    ['uom_id' => $tubeId, 'factor' => 1, 'price' => 148.00, 'cost' => 105.00, 'is_base' => true],
                ],
            ],
            [
                'product_type' => 'grocery',
                'brand_name' => "Nature's Spring Purified Drinking Water",
                'generic_name' => null,
                'dosage_strength' => '500ml',
                'dosage_form' => 'Bottle',
                'category' => 'Beverages',
                'sku' => 'NAT-SPR-500ML',
                'barcode' => '4806502341234',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false,
                'reorder_level' => 48,
                'storage_conditions' => 'Store away from direct sunlight',
                'description' => 'Bottled purified drinking water',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 15.00, 'cost' => 9.50, 'is_base' => true],
                    ['uom_id' => $boxId, 'factor' => 24, 'price' => 320.00, 'cost' => 210.00, 'is_base' => false],
                ],
            ],
            [
                'product_type' => 'grocery',
                'brand_name' => 'Pocari Sweat Ion Supply Drink',
                'generic_name' => null,
                'dosage_strength' => '500ml',
                'dosage_form' => 'Bottle',
                'category' => 'Beverages',
                'sku' => 'POC-SWT-500ML',
                'barcode' => '4571157256789',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false,
                'reorder_level' => 24,
                'storage_conditions' => 'Serve chilled',
                'description' => 'Electrolyte replenishment hydration drink',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 55.00, 'cost' => 40.00, 'is_base' => true],
                ],
            ],
            [
                'product_type' => 'grocery',
                'brand_name' => 'MamyPoko Extra Dry Diapers (Large)',
                'generic_name' => null,
                'dosage_strength' => '40 Pads',
                'dosage_form' => 'Pack',
                'category' => 'Baby Care',
                'sku' => 'MAM-DRY-L40',
                'barcode' => '8851111223344',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false,
                'reorder_level' => 10,
                'storage_conditions' => 'Keep pack dry and hygienic',
                'description' => 'Breathable taped baby diapers with speed air wave',
                'units' => [
                    ['uom_id' => $packId, 'factor' => 1, 'price' => 495.00, 'cost' => 380.00, 'is_base' => true],
                ],
            ],
            [
                'product_type' => 'grocery',
                'brand_name' => 'PediaSure Plus Vanilla Powder',
                'generic_name' => null,
                'dosage_strength' => '850g',
                'dosage_form' => 'Can',
                'category' => 'Nutritional Food',
                'sku' => 'PED-PLUS-850G',
                'barcode' => '8886451023456',
                'classification' => 'general',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => false,
                'reorder_level' => 8,
                'storage_conditions' => 'Store unopened can at room temperature',
                'description' => 'Complete and balanced nutrition for children 1-10 years old',
                'units' => [
                    ['uom_id' => $canId, 'factor' => 1, 'price' => 1380.00, 'cost' => 1120.00, 'is_base' => true],
                ],
            ],

            // ==================== MEDICAL SUPPLIES ====================
            [
                'product_type' => 'medical_supply',
                'brand_name' => 'Green Cross 70% Isopropyl Alcohol',
                'generic_name' => 'Isopropyl Alcohol',
                'dosage_strength' => '500ml',
                'dosage_form' => 'Bottle',
                'category' => 'Medical Supplies',
                'sku' => 'GRN-ALC-500ML',
                'barcode' => '4800078123456',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => true, // Medical supplies are eligible for SC/PWD benefits
                'reorder_level' => 20,
                'storage_conditions' => 'Flammable. Keep away from heat and open flame.',
                'description' => 'Antiseptic disinfectant with moisturizer',
                'units' => [
                    ['uom_id' => $bottleId, 'factor' => 1, 'price' => 95.00, 'cost' => 68.00, 'is_base' => true],
                ],
            ],
            [
                'product_type' => 'medical_supply',
                'brand_name' => 'Indoplas Sterile Gauze Pad 4x4',
                'generic_name' => 'Sterile Gauze',
                'dosage_strength' => '4x4 inches (Pack of 100)',
                'dosage_form' => 'Pack',
                'category' => 'Medical Supplies',
                'sku' => 'IND-GAU-4X4',
                'barcode' => '4800078999888',
                'classification' => 'otc',
                'requires_prescription' => false,
                'is_vatable' => true,
                'sc_pwd_discountable' => true,
                'reorder_level' => 15,
                'storage_conditions' => 'Store in clean dry area',
                'description' => '100% pure cotton medical dressing for wound care',
                'units' => [
                    ['uom_id' => $packId, 'factor' => 1, 'price' => 220.00, 'cost' => 155.00, 'is_base' => true],
                    ['uom_id' => $pieceId, 'factor' => 1, 'price' => 3.00, 'cost' => 1.60, 'is_base' => false],
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
