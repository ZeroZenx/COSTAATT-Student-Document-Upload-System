<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'doc_type',
        'original_name',
        'file_path',
        'size',
        'mime_type',
    ];

    protected $casts = [
        'size' => 'integer',
    ];


    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getDocTypeDisplayAttribute(): string
    {
        return match ($this->doc_type) {
            'birth_certificate' => 'Birth Certificate',
            'national_id' => 'National ID Card',
            'passport_photo' => 'Passport Photo',
            'academic_transcripts' => 'Academic Transcripts',
            'character_reference' => 'Character Reference',
            'medical_certificate' => 'Medical Certificate',
            'gate_approval' => 'GATE Approval Letter',
            'police_certificate' => 'Police Certificate of Character',
            'registration_form' => 'Registration Form',
            'fee_payment_receipt' => 'Fee Payment Receipt',
            'course_schedule' => 'Course Schedule',
            'student_id_card' => 'Student ID Card',
            default => ucwords(str_replace('_', ' ', $this->doc_type)),
        };
    }

    public function getFileExtensionAttribute(): string
    {
        return pathinfo($this->original_name, PATHINFO_EXTENSION);
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    public function getStoragePath(): string
    {
        return storage_path('app/' . $this->file_path);
    }

    public function exists(): bool
    {
        return file_exists($this->getStoragePath());
    }
}
