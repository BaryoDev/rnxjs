<?php

/**
 * rnxJS Laravel Configuration
 *
 * Configure rnxJS integration options for your Laravel application
 */

return [
    /*
    |--------------------------------------------------------------------------
    | CDN Configuration
    |--------------------------------------------------------------------------
    |
    | Whether to use CDN for loading rnxJS library and assets.
    | Set to false to serve from local public/vendor directory.
    |
    */
    'cdn' => env('RNX_CDN', true),

    /*
    |--------------------------------------------------------------------------
    | Default Theme
    |--------------------------------------------------------------------------
    |
    | The default theme to use for rnxJS styling.
    | Options: 'bootstrap', 'm3', 'plugins', or null
    |
    */
    'theme' => env('RNX_THEME', 'bootstrap'),

    /*
    |--------------------------------------------------------------------------
    | Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Storage plugin settings for persistent state
    |
    */
    'storage' => [
        'driver' => env('RNX_STORAGE_DRIVER', 'localStorage'),
        'prefix' => env('RNX_STORAGE_PREFIX', 'rnx_'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Router Configuration
    |--------------------------------------------------------------------------
    |
    | Router plugin settings for client-side routing
    |
    */
    'router' => [
        'mode' => env('RNX_ROUTER_MODE', 'hash'),
        'base' => env('RNX_ROUTER_BASE', '/'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Toast Plugin Configuration
    |--------------------------------------------------------------------------
    |
    | Toast notification settings
    |
    */
    'toast' => [
        'position' => env('RNX_TOAST_POSITION', 'top-right'),
        'duration' => (int) env('RNX_TOAST_DURATION', 3000),
        'max_toasts' => (int) env('RNX_TOAST_MAX', 5),
    ],
];
