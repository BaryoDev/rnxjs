<?php

namespace ArnelIrobles\RnxLaravel;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Str;
use Illuminate\Contracts\Support\Htmlable;

/**
 * Helper class for rnxJS Blade directives
 */
class RnxBladeHelper implements Htmlable
{
    /**
     * Generate rnxJS script includes
     *
     * @param bool $cdn Use CDN (default: true)
     * @param string $theme Theme to include ('bootstrap', 'm3', 'plugins', or null)
     * @return string HTML script tags
     */
    public function rnxScripts($cdn = true, $theme = 'bootstrap'): string
    {
        if ($cdn) {
            $scripts = '<!-- rnxJS from CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"><\/script>';

            if ($theme === 'm3') {
                $scripts .= '
<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">';
            } elseif ($theme === 'plugins') {
                $scripts .= '
<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/plugins.css" rel="stylesheet">';
            }

            return $scripts;
        } else {
            // Local file serving
            $scripts = '<!-- rnxJS from local files -->
<link href="{{ asset(\'css/bootstrap.min.css\') }}" rel="stylesheet">
<link href="{{ asset(\'css/bootstrap-icons.min.css\') }}" rel="stylesheet">
<script src="{{ asset(\'js/rnx.global.js\') }}"><\/script>';

            if ($theme === 'm3') {
                $scripts .= '
<link href="{{ asset(\'css/bootstrap-m3-theme.css\') }}" rel="stylesheet">';
            } elseif ($theme === 'plugins') {
                $scripts .= '
<link href="{{ asset(\'css/plugins.css\') }}" rel="stylesheet">';
            }

            return $scripts;
        }
    }

    /**
     * Create reactive state from Laravel data
     *
     * @param mixed $data Data to convert to state
     * @param string $varName Name of the state variable (default: 'state')
     * @return string JavaScript code to initialize state
     */
    public function rnxState($data, $varName = 'state'): string
    {
        try {
            $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return sprintf(
                '<script>console.error("rnxJS: Failed to serialize state: %s")</script>',
                $e->getMessage()
            );
        }

        return sprintf(
            '<script>
// Initialize reactive state from Laravel context
const %s = rnx.createReactiveState(%s);
rnx.loadComponents(document.body, %s);
</script>',
            $varName,
            $jsonData,
            $varName
        );
    }

    /**
     * Render an rnxJS component with props
     *
     * @param string $name Component name
     * @param array $props Component properties
     * @return string HTML component tag
     */
    public function rnxComponent($name, $props = []): string
    {
        $attrs = [];

        foreach ($props as $key => $value) {
            // Convert snake_case to kebab-case
            $attrName = Str::kebab($key);

            if (is_bool($value)) {
                if ($value) {
                    $attrs[] = $attrName;
                }
                continue;
            }

            // Check for data binding expressions
            if (is_string($value) && (
                Str::startsWith($value, 'state.') ||
                Str::startsWith($value, '{') ||
                Str::startsWith($value, '[')
            )) {
                $attrs[] = sprintf('%s="%s"', $attrName, $value);
            } elseif (is_numeric($value)) {
                $attrs[] = sprintf('%s=%s', $attrName, $value);
            } else {
                // Escape and quote string values
                $escaped = htmlspecialchars(strval($value), ENT_QUOTES, 'UTF-8');
                $attrs[] = sprintf('%s="%s"', $attrName, $escaped);
            }
        }

        $attrsStr = !empty($attrs) ? ' ' . implode(' ', $attrs) : '';

        return sprintf('<%s%s></%s>', $name, $attrsStr, $name);
    }

    /**
     * Initialize an rnxJS plugin
     *
     * @param string $name Plugin name ('router', 'toast', 'storage')
     * @param array $options Plugin configuration options
     * @return string JavaScript code to initialize plugin
     */
    public function rnxPlugin($name, $options = []): string
    {
        try {
            $optionsJson = json_encode($options, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            return sprintf(
                '<script>console.error("rnxJS: Failed to serialize plugin options: %s")</script>',
                $e->getMessage()
            );
        }

        return sprintf(
            '<script>
// Initialize rnxJS plugin: %s
if (window.rnx && window.rnx.plugins) {
  try {
    const plugin = rnx.%sPlugin ? rnx.%sPlugin(%s) : null;
    if (plugin) {
      rnx.plugins.use(plugin);
    }
  } catch (e) {
    console.error("[rnxJS] Failed to initialize %s plugin:", e);
  }
}
</script>',
            $name,
            Str::camel($name),
            Str::camel($name),
            $optionsJson,
            $name
        );
    }

    /**
     * Render the instance as an HTML string
     */
    public function toHtml(): string
    {
        return '';
    }

    /**
     * Magic method to call helpers as functions
     */
    public function __call($method, $arguments)
    {
        if (method_exists($this, $method)) {
            return call_user_func_array([$this, $method], $arguments);
        }

        throw new \BadMethodCallException(sprintf('Call to undefined method %s::%s()', static::class, $method));
    }
}
