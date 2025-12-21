# frozen_string_literal: true

require_relative 'rnx_rails/version'
require_relative 'rnx_rails/helpers'
require_relative 'rnx_rails/engine'

module RnxRails
  class Error < StandardError; end

  # Configuration for rnxRails
  class << self
    attr_accessor :configuration

    def configure
      self.configuration ||= Configuration.new
      yield(configuration)
    end

    def configuration
      @configuration ||= Configuration.new
    end
  end

  # Configuration class
  class Configuration
    attr_accessor :cdn, :theme, :storage_prefix, :router_mode, :toast_position, :toast_duration, :toast_max

    def initialize
      @cdn = ENV.fetch('RNX_CDN', true)
      @theme = ENV.fetch('RNX_THEME', 'bootstrap')
      @storage_prefix = ENV.fetch('RNX_STORAGE_PREFIX', 'rnx_')
      @router_mode = ENV.fetch('RNX_ROUTER_MODE', 'hash')
      @toast_position = ENV.fetch('RNX_TOAST_POSITION', 'top-right')
      @toast_duration = ENV.fetch('RNX_TOAST_DURATION', 3000).to_i
      @toast_max = ENV.fetch('RNX_TOAST_MAX', 5).to_i
    end
  end
end
