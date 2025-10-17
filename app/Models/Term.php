<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Term extends Model
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

        static::creating(function ($term) {
            if (empty($term->slug)) {
                $term->slug = Str::slug($term->name);
            }
        });

        static::updating(function ($term) {
            if ($term->isDirty('name') && empty($term->slug)) {
                $term->slug = Str::slug($term->name);
            }
        });

        static::saving(function ($term) {
            // Ensure only one term can be current
            if ($term->is_current) {
                static::where('id', '!=', $term->id)->update(['is_current' => false]);
            }
        });
    }

    /**
     * Get submissions for this term.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'intake_term', 'name');
    }

    /**
     * Get active terms ordered by sort order.
     */
    public static function getActiveTerms()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get the current term.
     */
    public static function getCurrentTerm()
    {
        return static::where('is_current', true)->first();
    }

    /**
     * Scope for active terms.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for current term.
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
     * Check if term is currently active based on dates.
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
