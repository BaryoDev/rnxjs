# frozen_string_literal: true

module RnxRails
  # Rails view helpers for rnxJS integration
  module Helpers
    # Generate rnxJS script includes
    #
    # @param cdn [Boolean] Use CDN (default: true)
    # @param theme [String] Theme to include ('bootstrap', 'm3', 'plugins', or nil)
    # @return [String] HTML script tags
    def rnx_scripts(cdn: RnxRails.configuration.cdn, theme: RnxRails.configuration.theme)
      if cdn
        scripts = <<~HTML
          <!-- rnxJS from CDN -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js"></script>
        HTML

        case theme
        when 'm3'
          scripts += '<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/bootstrap-m3-theme.css" rel="stylesheet">'
        when 'plugins'
          scripts += '<link href="https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/css/plugins.css" rel="stylesheet">'
        end

        scripts.html_safe
      else
        # Local file serving
        scripts = <<~HTML
          <!-- rnxJS from local files -->
          <link href="#{asset_path('bootstrap.min.css')}" rel="stylesheet">
          <link href="#{asset_path('bootstrap-icons.min.css')}" rel="stylesheet">
          <script src="#{asset_path('rnx.global.js')}"></script>
        HTML

        case theme
        when 'm3'
          scripts += "<link href=\"#{asset_path('bootstrap-m3-theme.css')}\" rel=\"stylesheet\">"
        when 'plugins'
          scripts += "<link href=\"#{asset_path('plugins.css')}\" rel=\"stylesheet\">"
        end

        scripts.html_safe
      end
    end

    # Create reactive state from Rails data
    #
    # @param data [Object] Data to convert to state
    # @param var_name [String] Name of the state variable (default: 'state')
    # @return [String] JavaScript code to initialize state
    def rnx_state(data, var_name = 'state')
      begin
        json_data = data.to_json
      rescue StandardError => e
        return tag.script("console.error('rnxJS: Failed to serialize state: #{e.message}')")
      end

      script = <<~JAVASCRIPT
        <script>
        // Initialize reactive state from Rails context
        const #{var_name} = rnx.createReactiveState(#{json_data});
        rnx.loadComponents(document.body, #{var_name});
        </script>
      JAVASCRIPT

      script.html_safe
    end

    # Render an rnxJS component with props
    #
    # @param name [String] Component name
    # @param props [Hash] Component properties
    # @return [String] HTML component tag
    def rnx_component(name, props = {})
      attrs = []

      props.each do |key, value|
        # Convert snake_case to kebab-case
        attr_name = key.to_s.gsub(/_/, '-')

        if value.is_a?(TrueClass)
          attrs << attr_name
        elsif value.is_a?(FalseClass)
          # Skip false boolean attributes
          next
        elsif value.is_a?(String) && (
          value.start_with?('state.') ||
          value.start_with?('{') ||
          value.start_with?('[')
        )
          # Preserve data binding expressions
          attrs << "#{attr_name}=\"#{value}\""
        elsif value.is_a?(Numeric)
          attrs << "#{attr_name}=#{value}"
        else
          # Escape and quote string values
          escaped = ERB::Util.html_escape(value.to_s)
          attrs << "#{attr_name}=\"#{escaped}\""
        end
      end

      attrs_str = attrs.any? ? " #{attrs.join(' ')}" : ''
      "<#{name}#{attrs_str}></#{name}>".html_safe
    end

    # Initialize an rnxJS plugin
    #
    # @param name [String] Plugin name ('router', 'toast', 'storage')
    # @param options [Hash] Plugin configuration options
    # @return [String] JavaScript code to initialize plugin
    def rnx_plugin(name, options = {})
      begin
        options_json = options.to_json
      rescue StandardError => e
        return tag.script("console.error('rnxJS: Failed to serialize plugin options: #{e.message}')")
      end

      camel_name = name.to_s.camelize(:lower)

      script = <<~JAVASCRIPT
        <script>
        // Initialize rnxJS plugin: #{name}
        if (window.rnx && window.rnx.plugins) {
          try {
            const plugin = rnx.#{camel_name}Plugin ? rnx.#{camel_name}Plugin(#{options_json}) : null;
            if (plugin) {
              rnx.plugins.use(plugin);
            }
          } catch (e) {
            console.error("[rnxJS] Failed to initialize #{name} plugin:", e);
          }
        }
        </script>
      JAVASCRIPT

      script.html_safe
    end

    # Create a data binding attribute
    #
    # @param path [String] Data path (e.g., 'user.name')
    # @return [String] data-bind attribute
    def data_bind(path)
      "data-bind=\"#{ERB::Util.html_escape(path)}\"".html_safe
    end

    # Create a validation rule attribute
    #
    # @param rules [String, Array] Validation rules
    # @return [String] data-rule attribute
    def data_rule(rules)
      rules_str = rules.is_a?(Array) ? rules.join('|') : rules.to_s
      "data-rule=\"#{ERB::Util.html_escape(rules_str)}\"".html_safe
    end
  end
end
