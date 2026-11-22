<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'fname' => 'Juan',
                'mname' => 'Santos',
                'lname' => 'Dela Cruz',
                'sex' => 'male',
                'name' => 'Juan Dela Cruz',
                'email' => 'admin@localhost',
                'password' => Hash::make('a'),
                'role' => 'admin',
                'status' => 'active',
                'pin' => '1234',
                'phone' => '09171234567',
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'Grace',
                'mname' => 'Flores',
                'lname' => 'Villanueva',
                'sex' => 'female',
                'name' => 'Grace Villanueva',
                'email' => 'cashier1@localhost',
                'password' => Hash::make('a'),
                'role' => 'cashier',
                'status' => 'active',
                'pin' => '1111',
                'phone' => '09181234567',
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'Carlo',
                'mname' => 'Reyes',
                'lname' => 'Bautista',
                'sex' => 'male',
                'name' => 'Carlo Bautista',
                'email' => 'cashier2@localhost',
                'password' => Hash::make('a'),
                'role' => 'cashier',
                'status' => 'active',
                'pin' => '2222',
                'phone' => '09191234567',
                'email_verified_at' => now(),
            ],
            [
                'fname' => 'Patricia',
                'mname' => 'Cruz',
                'lname' => 'Mendoza',
                'sex' => 'female',
                'name' => 'Patricia Mendoza',
                'email' => 'cashier3@localhost',
                'password' => Hash::make('a'),
                'role' => 'cashier',
                'status' => 'active',
                'pin' => '3333',
                'phone' => '09201234567',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
