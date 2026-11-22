<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $role = User::count() === 0 ? 'admin' : 'cashier';

        return User::create([
            'fname' => $input['fname'] ?? null,
            'mname' => $input['mname'] ?? null,
            'lname' => $input['lname'] ?? null,
            'sex' => $input['sex'] ?? null,
            'name' => $input['name'] ?? trim(($input['fname'] ?? '').' '.($input['lname'] ?? '')),
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'role' => $role,
            'status' => 'active',
            'pin' => '0000',
        ]);
    }
}
