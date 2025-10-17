<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $semesters = [
            [
                'name' => 'Semester I',
                'short_name' => 'S1',
                'start_date' => '2025-09-01',
                'end_date' => '2025-12-31',
                'is_active' => true,
                'is_current' => true, // Set as current semester
                'description' => 'First semester of the academic year',
                'sort_order' => 1,
            ],
            [
                'name' => 'Semester II',
                'short_name' => 'S2',
                'start_date' => '2026-01-01',
                'end_date' => '2026-04-30',
                'is_active' => true,
                'is_current' => false,
                'description' => 'Second semester of the academic year',
                'sort_order' => 2,
            ],
        ];

        foreach ($semesters as $semesterData) {
            Semester::create($semesterData);
        }
    }
}
