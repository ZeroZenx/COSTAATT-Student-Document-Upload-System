<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $academicYears = [
            [
                'name' => '2025-2026',
                'start_date' => '2025-09-01',
                'end_date' => '2026-08-31',
                'is_active' => true,
                'is_current' => true, // Set as current academic year
                'description' => 'Academic Year 2025-2026',
                'sort_order' => 1,
            ],
            [
                'name' => '2026-2027',
                'start_date' => '2026-09-01',
                'end_date' => '2027-08-31',
                'is_active' => true,
                'is_current' => false,
                'description' => 'Academic Year 2026-2027',
                'sort_order' => 2,
            ],
        ];

        foreach ($academicYears as $academicYearData) {
            AcademicYear::create($academicYearData);
        }
    }
}
