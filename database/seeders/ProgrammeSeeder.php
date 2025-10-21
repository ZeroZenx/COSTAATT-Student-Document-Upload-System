<?php

namespace Database\Seeders;

use App\Models\Programme;
use App\Models\ProgrammeDocument;
use Illuminate\Database\Seeder;

class ProgrammeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programmes = [
            [
                'name' => 'Early Childhood Care and Education (BA)',
                'code' => 'ECCE-BA',
                'description' => 'Bachelor of Arts in Early Childhood Care and Education',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Medical Laboratory Technology (AAS, BSc)',
                'code' => 'MLT-AAS',
                'description' => 'Associate/Bachelor of Science in Medical Laboratory Technology',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Medical Ultrasound (AdvDip)',
                'code' => 'MU-AD',
                'description' => 'Advanced Diploma in Medical Ultrasound',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Radiography (BSc)',
                'code' => 'RAD-BSC',
                'description' => 'Bachelor of Science in Radiography',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Environmental Health (AAS, BSc)',
                'code' => 'EH-AAS',
                'description' => 'Associate/Bachelor of Science in Environmental Health',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Occupational Safety and Health (AAS, BSc)',
                'code' => 'OSH-AAS',
                'description' => 'Associate/Bachelor of Science in Occupational Safety and Health',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Social Work (BSW)',
                'code' => 'SW-BSW',
                'description' => 'Bachelor of Social Work',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'General Nursing (AAS, BSc)',
                'code' => 'GN-AAS',
                'description' => 'Associate/Bachelor of Science in General Nursing',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 8,
            ],
            [
                'name' => 'Psychiatric Nursing (AAS, BSc)',
                'code' => 'PN-AAS',
                'description' => 'Associate/Bachelor of Science in Psychiatric Nursing',
                'department' => 'ADMISSIONS',
                'active' => true,
                'sort_order' => 9,
            ],
        ];

        foreach ($programmes as $programmeData) {
            Programme::create($programmeData);
        }

        $this->command->info('Programmes seeded successfully!');
        $this->command->info('Note: You can now add document requirements for each programme via the admin interface.');
    }
}
