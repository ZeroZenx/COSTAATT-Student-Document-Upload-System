<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admissions_checklists', function (Blueprint $table) {
            $table->id();
            $table->string('programme');
            $table->string('intake_term');
            $table->string('campus');
            $table->string('doc_type');
            $table->boolean('required')->default(true);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['programme', 'intake_term', 'campus']);
            $table->index(['programme', 'intake_term', 'campus', 'doc_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions_checklists');
    }
};
