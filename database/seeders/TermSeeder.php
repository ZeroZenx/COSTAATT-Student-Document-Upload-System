<?php

namespace Database\Seeders;

use App\Models\Term;
use Illuminate\Database\Seeder;

class TermSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $terms = [
            [
                'name' => 'September 2024',
                'start_date' => '2024-09-01',
                'end_date' => '2024-12-31',
                'is_active' => true,
                'is_current' => false,
                'description' => 'Fall 2024 semester',
                'sort_order' => 1,
            ],
            [
                'name' => 'January 2025',
                'start_date' => '2025-01-01',
                'end_date' => '2025-04-30',
                'is_active' => true,
                'is_current' => true, // Set as current term
                'description' => 'Spring 2025 semester',
                'sort_order' => 2,
            ],
            [
                'name' => 'May 2025',
                'start_date' => '2025-05-01',
                'end_date' => '2025-08-31',
                'is_active' => true,
                'is_current' => false,
                'description' => 'Summer 2025 semester',
                'sort_order' => 3,
            ],
            [
                'name' => 'September 2025',
                'start_date' => '2025-09-01',
                'end_date' => '2025-12-31',
                'is_active' => true,
                'is_current' => false,
                'description' => 'Fall 2025 semester',
                'sort_order' => 4,
            ],
        ];

        foreach ($terms as $termData) {
            Term::create($termData);
        }
    }
}
