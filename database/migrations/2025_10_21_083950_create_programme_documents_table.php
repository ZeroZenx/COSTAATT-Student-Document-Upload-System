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
        Schema::create('programme_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programme_id')->constrained()->onDelete('cascade');
            $table->string('doc_type'); // e.g., 'passport_photo', 'academic_transcripts'
            $table->boolean('required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Ensure no duplicate document types per programme
            $table->unique(['programme_id', 'doc_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programme_documents');
    }
};
