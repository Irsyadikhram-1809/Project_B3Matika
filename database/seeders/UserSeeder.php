<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun awal — GANTI password ini di produksi.
        $accounts = [
            ['Administrator', 'admin@b3matika.test', 'admin12345', User::ROLE_ADMIN],
            ['Siswa Demo', 'siswa@b3matika.test', 'siswa12345', User::ROLE_USER],
        ];

        foreach ($accounts as [$name, $email, $password, $role]) {
            User::unguarded(fn () => User::updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => $password, 'role' => $role],
            ));
        }
    }
}
