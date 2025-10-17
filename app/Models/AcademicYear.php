<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'start_date',
        'end_date',
        'is_active',
        'is_current',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'is_current' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($academicYear) {
            if (empty($academicYear->slug)) {
                $academicYear->slug = Str::slug($academicYear->name);
            }
        });

        static::updating(function ($academicYear) {
            if ($academicYear->isDirty('name') && empty($academicYear->slug)) {
                $academicYear->slug = Str::slug($academicYear->name);
            }
        });

        static::saving(function ($academicYear) {
            // Ensure only one academic year can be current
            if ($academicYear->is_current) {
                static::where('id', '!=', $academicYear->id)->update(['is_current' => false]);
            }
        });
    }

    /**
     * Get submissions for this academic year.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'academic_year', 'name');
    }

    /**
     * Get active academic years ordered by sort order.
     */
    public static function getActiveAcademicYears()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get the current academic year.
     */
    public static function getCurrentAcademicYear()
    {
        return static::where('is_current', true)->first();
    }

    /**
     * Scope for active academic years.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for current academic year.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Get formatted date range.
     */
    public function getDateRangeAttribute(): string
    {
        if (!$this->start_date || !$this->end_date) {
            return '';
        }

        return $this->start_date->format('M j') . ' - ' . $this->end_date->format('M j, Y');
    }

    /**
     * Check if academic year is currently active based on dates.
     */
    public function getIsCurrentlyActiveAttribute(): bool
    {
        if (!$this->start_date || !$this->end_date) {
            return $this->is_active;
        }

        $now = now();
        return $this->is_active && $now->between($this->start_date, $this->end_date);
    }
}
