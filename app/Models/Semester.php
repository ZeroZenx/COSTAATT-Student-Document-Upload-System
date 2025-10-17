<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'short_name',
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

        static::creating(function ($semester) {
            if (empty($semester->slug)) {
                $semester->slug = Str::slug($semester->name);
            }
        });

        static::updating(function ($semester) {
            if ($semester->isDirty('name') && empty($semester->slug)) {
                $semester->slug = Str::slug($semester->name);
            }
        });

        static::saving(function ($semester) {
            // Ensure only one semester can be current
            if ($semester->is_current) {
                static::where('id', '!=', $semester->id)->update(['is_current' => false]);
            }
        });
    }

    /**
     * Get submissions for this semester.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'semester', 'name');
    }

    /**
     * Get active semesters ordered by sort order.
     */
    public static function getActiveSemesters()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get the current semester.
     */
    public static function getCurrentSemester()
    {
        return static::where('is_current', true)->first();
    }

    /**
     * Scope for active semesters.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for current semester.
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
     * Check if semester is currently active based on dates.
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
