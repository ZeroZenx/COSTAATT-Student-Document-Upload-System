<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionsChecklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'programme',
        'intake_term',
        'campus',
        'dept',
        'doc_type',
        'required',
        'active',
    ];

    protected $casts = [
        'required' => 'boolean',
        'active' => 'boolean',
    ];

    const DOC_TYPES = [
        // Admissions documents
        'birth_certificate' => 'Birth Certificate',
        'national_id' => 'National ID Card',
        'passport' => 'Passport',
        'passport_photo' => 'Passport Biodata page',
        'academic_transcripts' => 'Academic Transcripts',
        'character_reference' => 'Character Reference',
        'medical_certificate' => 'Medical Certificate',
        'gate_approval' => 'GATE Approval Letter',
        'police_certificate' => 'Police Certificate of Character',
        'nursing_council_permit' => 'Nursing Council Permit',
        'caricom_certificate' => 'CARICOM Certificate',
        'study_permit' => 'Study Permit',
        'personal_statement' => 'Personal Statement',
        
        // Registry documents
        'official_offer_letter' => 'Official Offer of Admission Letter',
        'signed_acceptance_form' => 'Signed Acceptance of Offer Form',
        'gate_approval_or_payment' => 'Proof of GATE Approval or Payment Plan Confirmation',
        'medical_form' => 'Medical Form',
        'student_photo' => 'Student Photo (Passport-sized)',
        'registration_form' => 'Registration Form',
        'fee_payment_receipt' => 'Fee Payment Receipt',
        'course_schedule' => 'Course Schedule',
        'student_id_card' => 'Student ID Card',
    ];

    public function getDocTypeDisplayAttribute(): string
    {
        return self::DOC_TYPES[$this->doc_type] ?? ucwords(str_replace('_', ' ', $this->doc_type));
    }

    public function scopeForProgramme($query, string $programme, string $intakeTerm, string $campus, string $fundingType, string $dept = 'ADMISSIONS', ?string $nationality = null)
    {
        return $query->where('programme', $programme)
                    ->where('intake_term', $intakeTerm)
                    ->where('campus', $campus)
                    ->where('dept', $dept)
                    ->where('active', true)
                    ->where('doc_type', '!=', 'personal_statement') // Personal statements not required for any applicants
                    ->when($fundingType === 'SELF', function ($q) {
                        $q->where('doc_type', '!=', 'gate_approval');
                    })
                    ->when($nationality, function ($q, $nationality) {
                        // For nationality-specific requirements
                        if ($nationality === 'TT National') {
                            // TT Nationals don't need passport
                            $q->where('doc_type', '!=', 'passport');
                        } else {
                            // International and CARICOM applicants don't need TT ID or birth certificate
                            $q->whereNotIn('doc_type', ['national_id', 'birth_certificate']);
                        }
                    });
    }

    public function scopeRequired($query)
    {
        return $query->where('required', true);
    }

    public function scopeOptional($query)
    {
        return $query->where('required', false);
    }

    public static function getRequiredDocuments(string $programme, string $intakeTerm, string $campus, string $fundingType, string $dept = 'ADMISSIONS', ?string $nationality = null): array
    {
        return self::forProgramme($programme, $intakeTerm, $campus, $fundingType, $dept, $nationality)
                   ->required()
                   ->orderBy('doc_type')
                   ->get()
                   ->pluck('doc_type')
                   ->toArray();
    }

    public static function getOptionalDocuments(string $programme, string $intakeTerm, string $campus, string $fundingType, string $dept = 'ADMISSIONS', ?string $nationality = null): array
    {
        return self::forProgramme($programme, $intakeTerm, $campus, $fundingType, $dept, $nationality)
                   ->optional()
                   ->orderBy('doc_type')
                   ->get()
                   ->pluck('doc_type')
                   ->toArray();
    }

    public static function getAllDocuments(string $programme, string $intakeTerm, string $campus, string $fundingType, string $dept = 'ADMISSIONS', ?string $nationality = null): array
    {
        return self::forProgramme($programme, $intakeTerm, $campus, $fundingType, $dept, $nationality)
                   ->orderBy('required', 'desc')
                   ->orderBy('doc_type')
                   ->get()
                   ->map(function ($item) {
                       return [
                           'doc_type' => $item->doc_type,
                           'display_name' => $item->doc_type_display,
                           'required' => $item->required,
                       ];
                   })
                   ->toArray();
    }
}
