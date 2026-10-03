<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /** Jumlah materi per kelas untuk beranda. */
    public function __invoke(): JsonResponse
    {
        $counts = Topic::query()
            ->selectRaw('grade, COUNT(*) AS total')
            ->groupBy('grade')
            ->pluck('total', 'grade');

        return response()->json(['counts' => (object) $counts->all()]);
    }
}
