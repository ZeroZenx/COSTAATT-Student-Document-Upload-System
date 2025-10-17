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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->index();
            $table->string('email')->index();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('dob');
            $table->string('programme');
            $table->string('intake_term');
            $table->string('campus');
            $table->enum('funding_type', ['GATE', 'SELF']);
            $table->enum('dept', ['ADMISSIONS', 'REGISTRY']);
            $table->enum('status', ['IN_PROGRESS', 'SUBMITTED', 'PROCESSING', 'COMPLETED'])->default('IN_PROGRESS');
            $table->string('reference')->nullable()->unique()->index();
            $table->string('academic_year')->nullable();
            $table->string('semester')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'dept']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
