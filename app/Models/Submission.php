<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'email',
        'first_name',
        'last_name',
        'dob',
        'programme',
        'post_compass_programme',
        'intake_term',
        'campus',
        'nationality',
        'funding_type',
        'dept',
        'status',
        'reference',
        'academic_year',
        'semester',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    const STATUS_IN_PROGRESS = 'IN_PROGRESS';
    const STATUS_SUBMITTED = 'SUBMITTED';
    const STATUS_PROCESSING = 'PROCESSING';
    const STATUS_COMPLETED = 'COMPLETED';

    const DEPT_ADMISSIONS = 'ADMISSIONS';
    const DEPT_REGISTRY = 'REGISTRY';

    const FUNDING_GATE = 'GATE';
    const FUNDING_SELF = 'SELF';

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getStatusBadgeClassAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_IN_PROGRESS => 'bg-yellow-100 text-yellow-800',
            self::STATUS_SUBMITTED => 'bg-blue-100 text-blue-800',
            self::STATUS_PROCESSING => 'bg-orange-100 text-orange-800',
            self::STATUS_COMPLETED => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getStatusDisplayAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_SUBMITTED => 'Submitted',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_COMPLETED => 'Completed',
            default => 'Unknown',
        };
    }

    public function getFundingTypeDisplayAttribute(): string
    {
        return match ($this->funding_type) {
            self::FUNDING_GATE => 'GATE',
            self::FUNDING_SELF => 'Self-Funded',
            default => 'Unknown',
        };
    }

    public function getDepartmentDisplayAttribute(): string
    {
        return match ($this->dept) {
            self::DEPT_ADMISSIONS => 'Admissions',
            self::DEPT_REGISTRY => 'Registry',
            default => 'Unknown',
        };
    }

    public function hasDocument(string $docType): bool
    {
        return $this->documents()->where('doc_type', $docType)->exists();
    }

    public function getDocument(string $docType): ?Document
    {
        return $this->documents()->where('doc_type', $docType)->first();
    }

    public function generateReference(): string
    {
        $prefix = $this->dept === self::DEPT_ADMISSIONS ? 'ADM' : 'REG';
        $year = date('Y');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        return $prefix . $year . $random;
    }
}
