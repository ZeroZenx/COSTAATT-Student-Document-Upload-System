<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'microsoft' => [
        'client_id' => env('GRAPH_CLIENT_ID'),
        'client_secret' => env('GRAPH_CLIENT_SECRET'),
        'tenant_id' => env('GRAPH_TENANT_ID'),
        'sender_upn' => env('GRAPH_SENDER_UPN'),
        'upload_root_admissions' => env('GRAPH_UPLOAD_ROOT_ADMISSIONS', 'Admissions'),
        'upload_root_registry' => env('GRAPH_UPLOAD_ROOT_REGISTRY', 'Registry'),
    ],

];
