<?php

namespace ArnelIrobles\RnxLaravel;

use Illuminate\Support\ServiceProvider;

/**
 * rnxJS Service Provider for Laravel
 *
 * Registers rnxJS Blade directives and helpers for Laravel applications.
 */
class RnxServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Service registration
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerBladeDirectives();
        $this->registerHelpers();
        $this->publishAssets();
    }

    /**
     * Register Blade directives
     */
    private function registerBladeDirectives(): void
    {
        // @rnxScripts directive
        $this->blade('rnxScripts', function ($cdn = 'true', $theme = 'bootstrap') {
            return $this->rnxScripts($cdn === 'true', $theme);
        });

        // @rnxState directive
        $this->blade('rnxState', function ($data, $varName = 'state') {
            return $this->rnxState($data, $varName);
        });

        // @rnxComponent directive
        $this->blade('rnxComponent', function ($name, $props = []) {
            return $this->rnxComponent($name, $props);
        });

        // @rnxPlugin directive
        $this->blade('rnxPlugin', function ($name, $options = []) {
            return $this->rnxPlugin($name, $options);
        });

        // @endRnxComponent for closing tags
        $this->blade('endRnxComponent', function () {
            return '';
        });
    }

    /**
     * Register global helpers
     */
    private function registerHelpers(): void
    {
        if (!function_exists('rnx_scripts')) {
            function rnx_scripts($cdn = true, $theme = 'bootstrap') {
                return app(RnxBladeHelper::class)->rnxScripts($cdn, $theme);
            }
        }

        if (!function_exists('rnx_state')) {
            function rnx_state($data, $varName = 'state') {
                return app(RnxBladeHelper::class)->rnxState($data, $varName);
            }
        }

        if (!function_exists('rnx_component')) {
            function rnx_component($name, $props = []) {
                return app(RnxBladeHelper::class)->rnxComponent($name, $props);
            }
        }

        if (!function_exists('rnx_plugin')) {
            function rnx_plugin($name, $options = []) {
                return app(RnxBladeHelper::class)->rnxPlugin($name, $options);
            }
        }
    }

    /**
     * Publish package assets
     */
    private function publishAssets(): void
    {
        $this->publishes([
            __DIR__ . '/../config/rnx.php' => config_path('rnx.php'),
        ], 'rnx-config');

        $this->publishes([
            __DIR__ . '/../resources/views' => resource_path('views/vendor/rnx'),
        ], 'rnx-views');
    }

    /**
     * Register a Blade directive
     */
    protected function blade($name, $callback): void
    {
        \Blade::directive($name, $callback);
    }

    /**
     * Helper methods delegated to RnxBladeHelper
     */
    protected function rnxScripts($cdn, $theme)
    {
        return app(RnxBladeHelper::class)->rnxScripts($cdn, $theme);
    }

    protected function rnxState($data, $varName)
    {
        return app(RnxBladeHelper::class)->rnxState($data, $varName);
    }

    protected function rnxComponent($name, $props)
    {
        return app(RnxBladeHelper::class)->rnxComponent($name, $props);
    }

    protected function rnxPlugin($name, $options)
    {
        return app(RnxBladeHelper::class)->rnxPlugin($name, $options);
    }
}
