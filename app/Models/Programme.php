<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'department',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the documents associated with this programme
     */
    public function documents()
    {
        return $this->hasMany(ProgrammeDocument::class);
    }

    /**
     * Get required documents for this programme
     */
    public function requiredDocuments()
    {
        return $this->documents()->where('required', true)->orderBy('sort_order');
    }

    /**
     * Get optional documents for this programme
     */
    public function optionalDocuments()
    {
        return $this->documents()->where('required', false)->orderBy('sort_order');
    }

    /**
     * Scope to get only active programmes
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get programmes by department
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Get programmes ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
