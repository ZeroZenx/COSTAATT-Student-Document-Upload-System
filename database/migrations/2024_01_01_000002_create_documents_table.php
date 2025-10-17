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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained()->onDelete('cascade');
            $table->string('doc_type');
            $table->string('original_name');
            $table->string('file_path');
            $table->bigInteger('size');
            $table->string('mime_type');
            $table->timestamps();

            $table->index(['submission_id', 'doc_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
