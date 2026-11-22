<?php

namespace Database\Seeders;

use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;

class UnitOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            [
                'name' => 'Piece / Tablet',
                'short_code' => 'pc',
                'category' => 'Solid Oral',
                'description' => 'Single tablet or oral piece dispensing unit',
                'is_active' => true,
            ],
            [
                'name' => 'Capsule',
                'short_code' => 'cap',
                'category' => 'Solid Oral',
                'description' => 'Single oral capsule formulation',
                'is_active' => true,
            ],
            [
                'name' => 'Blister Pack',
                'short_code' => 'blst',
                'category' => 'Packaging',
                'description' => 'Foil/plastic blister card containing multiple tablets',
                'is_active' => true,
            ],
            [
                'name' => 'Strip',
                'short_code' => 'strp',
                'category' => 'Packaging',
                'description' => 'Sealed foil strip of tablets or capsules',
                'is_active' => true,
            ],
            [
                'name' => 'Box',
                'short_code' => 'box',
                'category' => 'Packaging',
                'description' => 'Outer commercial packaging containing strips or bottles',
                'is_active' => true,
            ],
            [
                'name' => 'Bottle',
                'short_code' => 'btl',
                'category' => 'Liquid',
                'description' => 'Liquid suspension, syrup, drops, or beverage bottle',
                'is_active' => true,
            ],
            [
                'name' => 'Sachet',
                'short_code' => 'sach',
                'category' => 'Powder / Granule',
                'description' => 'Sealed sachet containing powder (e.g. ORS, shampoo sachet)',
                'is_active' => true,
            ],
            [
                'name' => 'Tube',
                'short_code' => 'tube',
                'category' => 'Topical',
                'description' => 'Ointment, cream, or toothpaste tube container',
                'is_active' => true,
            ],
            [
                'name' => 'Bar',
                'short_code' => 'bar',
                'category' => 'Toiletries / Soap',
                'description' => 'Bar of bath soap or detergent',
                'is_active' => true,
            ],
            [
                'name' => 'Can / Tin',
                'short_code' => 'can',
                'category' => 'Grocery / Food',
                'description' => 'Can of infant milk powder or nutritional formula',
                'is_active' => true,
            ],
            [
                'name' => 'Pack / Roll',
                'short_code' => 'pack',
                'category' => 'General / Supply',
                'description' => 'Pack of diapers, wipes, tissue, or medical gauze',
                'is_active' => true,
            ],
            [
                'name' => 'Nebule',
                'short_code' => 'neb',
                'category' => 'Inhalation',
                'description' => 'Unit-dose liquid ampoule for nebulizer therapy',
                'is_active' => true,
            ],
            [
                'name' => 'Vial',
                'short_code' => 'vial',
                'category' => 'Injectable',
                'description' => 'Glass container holding injectable liquid or powder',
                'is_active' => true,
            ],
            [
                'name' => 'Ampoule',
                'short_code' => 'amp',
                'category' => 'Injectable',
                'description' => 'Hermetically sealed glass capsule for parenteral injection',
                'is_active' => true,
            ],
        ];

        foreach ($units as $unit) {
            UnitOfMeasure::updateOrCreate(
                ['name' => $unit['name']],
                $unit
            );
        }
    }
}
