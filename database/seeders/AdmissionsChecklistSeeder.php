<?php

namespace Database\Seeders;

use App\Models\AdmissionsChecklist;
use Illuminate\Database\Seeder;

class AdmissionsChecklistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programmes = [
            'Early Childhood Care and Education (BA)',
            'Medical Laboratory Technology (AAS, BSc)',
            'Medical Ultrasound (AdvDip)',
            'Radiography (BSc)',
            'Environmental Health (AAS, BSc)',
            'Occupational Safety and Health (AAS, BSc)',
            'Social Work (BSW)',
            'General Nursing (AAS, BSc)',
            'Psychiatric Nursing (AAS, BSc)',
        ];

        $intakeTerms = [
            'September 2024',
            'January 2025',
            'May 2025',
            'September 2025',
        ];

        $campuses = [
            'Port of Spain Campus',
            'San Fernando Campus',
            'Tobago Campus',
            'Chaguanas Campus',
        ];

        $admissionsDocTypes = [
            'birth_certificate' => true,
            'national_id' => true,
            'passport' => true,
            'passport_photo' => true,
            'academic_transcripts' => true,
            'character_reference' => true,
            'medical_certificate' => true,
            'gate_approval' => true,
            'police_certificate' => false,
            'nursing_council_permit' => false, // For nursing programmes
            'caricom_certificate' => false, // For CARICOM nationals
            'study_permit' => false, // For international students
        ];

        $registryDocTypes = [
            'official_offer_letter' => true,
            'signed_acceptance_form' => true,
            'gate_approval_or_payment' => true,
            'medical_form' => true,
            'student_photo' => true,
            'registration_form' => false,
            'fee_payment_receipt' => false,
            'course_schedule' => false,
            'student_id_card' => false,
        ];

        // Seed Admissions documents
        foreach ($programmes as $programme) {
            foreach ($intakeTerms as $intakeTerm) {
                foreach ($campuses as $campus) {
                    foreach ($admissionsDocTypes as $docType => $required) {
                        AdmissionsChecklist::create([
                            'programme' => $programme,
                            'intake_term' => $intakeTerm,
                            'campus' => $campus,
                            'dept' => 'ADMISSIONS',
                            'doc_type' => $docType,
                            'required' => $required,
                            'active' => true,
                        ]);
                    }
                }
            }
        }

        // Seed Registry documents
        foreach ($programmes as $programme) {
            foreach ($intakeTerms as $intakeTerm) {
                foreach ($campuses as $campus) {
                    foreach ($registryDocTypes as $docType => $required) {
                        AdmissionsChecklist::create([
                            'programme' => $programme,
                            'intake_term' => $intakeTerm,
                            'campus' => $campus,
                            'dept' => 'REGISTRY',
                            'doc_type' => $docType,
                            'required' => $required,
                            'active' => true,
                        ]);
                    }
                }
            }
        }
    }
}
