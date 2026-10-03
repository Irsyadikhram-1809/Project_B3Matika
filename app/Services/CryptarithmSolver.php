<?php

namespace App\Services;

/**
 * Memeriksa jawaban puzzle cryptarithm, contoh: "SEND + MORE = MONEY".
 * Tiap huruf = satu angka berbeda (0-9), angka pertama sebuah kata tidak boleh 0.
 */
class CryptarithmSolver
{
    /** @return list<string> huruf unik pada persamaan */
    public static function letters(string $equation): array
    {
        preg_match_all('/[A-Z]/', $equation, $matches);

        return array_values(array_unique($matches[0]));
    }

    /** @param array<string, mixed> $map contoh: ['S' => 9, 'E' => 5, ...] */
    public function check(string $equation, array $map): bool
    {
        $values = [];
        foreach (self::letters($equation) as $letter) {
            $digit = $map[$letter] ?? null;
            if (! is_scalar($digit) || ! preg_match('/^[0-9]$/', (string) $digit)) {
                return false;
            }
            $values[$letter] = (int) $digit;
        }

        if (count(array_unique($values)) !== count($values)) {
            return false;
        }

        $numbers = [];
        foreach (array_map('trim', preg_split('/[+=]/', $equation)) as $word) {
            if ($word === '' || (strlen($word) > 1 && $values[$word[0]] === 0)) {
                return false;
            }
            $number = '';
            foreach (str_split($word) as $char) {
                if (! isset($values[$char])) {
                    return false;
                }
                $number .= $values[$char];
            }
            $numbers[] = (int) $number;
        }

        $result = array_pop($numbers);

        return array_sum($numbers) === $result;
    }
}
