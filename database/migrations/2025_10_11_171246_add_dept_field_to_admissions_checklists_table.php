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
        Schema::table('admissions_checklists', function (Blueprint $table) {
            $table->string('dept')->default('ADMISSIONS')->after('campus');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admissions_checklists', function (Blueprint $table) {
            $table->dropColumn('dept');
        });
    }
};