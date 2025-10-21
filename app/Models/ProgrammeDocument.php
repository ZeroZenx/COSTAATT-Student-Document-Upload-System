<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgrammeDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'programme_id',
        'doc_type',
        'required',
        'sort_order',
    ];

    protected $casts = [
        'required' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the programme that owns this document requirement
     */
    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    /**
     * Get the display name for the document type
     */
    public function getDisplayNameAttribute(): string
    {
        $docTypes = [
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

        return $docTypes[$this->doc_type] ?? ucwords(str_replace('_', ' ', $this->doc_type));
    }
}
