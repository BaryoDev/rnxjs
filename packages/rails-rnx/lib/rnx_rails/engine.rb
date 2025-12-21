# frozen_string_literal: true

module RnxRails
  class Engine < ::Rails::Engine
    isolate_namespace RnxRails

    config.generators do |g|
      g.test_framework :rspec
    end

    initializer 'rnx_rails.view_helpers' do |app|
      ActiveSupport.on_load(:action_view) do
        include RnxRails::Helpers
      end
    end

    initializer 'rnx_rails.asset_pipeline' do |app|
      app.config.assets.paths << File.join(root, 'app', 'assets')
    end
  end
end
