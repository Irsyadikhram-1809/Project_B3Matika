<?php

namespace Tests\Unit;

use App\Services\CryptarithmSolver;
use PHPUnit\Framework\TestCase;

class CryptarithmSolverTest extends TestCase
{
    public function test_letters_are_unique(): void
    {
        $this->assertSame(['T', 'O', 'G', 'U'], CryptarithmSolver::letters('TO + GO = OUT'));
    }

    public function test_correct_solution_is_accepted(): void
    {
        // 9567 + 1085 = 10652
        $map = ['S' => 9, 'E' => 5, 'N' => 6, 'D' => 7, 'M' => 1, 'O' => 0, 'R' => 8, 'Y' => 2];

        $this->assertTrue((new CryptarithmSolver)->check('SEND + MORE = MONEY', $map));
    }

    public function test_wrong_leading_zero_duplicate_and_missing_are_rejected(): void
    {
        $solver = new CryptarithmSolver;
        $good = ['S' => 9, 'E' => 5, 'N' => 6, 'D' => 7, 'M' => 1, 'O' => 0, 'R' => 8, 'Y' => 2];

        $this->assertFalse($solver->check('SEND + MORE = MONEY', [...$good, 'Y' => 3]));
        $this->assertFalse($solver->check('SEND + MORE = MONEY', [...$good, 'Y' => 7]));
        $this->assertFalse($solver->check('SEND + MORE = MONEY', [...$good, 'S' => 0]));
        $this->assertFalse($solver->check('SEND + MORE = MONEY', ['S' => 9]));
    }
}
