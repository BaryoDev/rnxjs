# frozen_string_literal: true

require_relative 'lib/rnx_rails/version'

Gem::Specification.new do |spec|
  spec.name = 'rnx_rails'
  spec.version = RnxRails::VERSION
  spec.authors = ['Arnel Irobles']
  spec.email = ['arnel@arnelirobles.com']

  spec.summary = 'rnxJS integration for Rails - View helpers and directives for reactive components'
  spec.description = 'Rails gem providing view helpers, ERB directives, and configuration for integrating rnxJS reactive components into Rails applications'
  spec.homepage = 'https://github.com/arnelirobles/rnxjs'
  spec.license = 'MPL-2.0'
  spec.required_ruby_version = '>= 2.7'

  spec.metadata = {
    'homepage_uri' => spec.homepage,
    'source_code_uri' => spec.homepage,
    'changelog_uri' => "#{spec.homepage}/releases",
    'bug_tracker_uri' => "#{spec.homepage}/issues",
    'documentation_uri' => "#{spec.homepage}/tree/main/packages/rails-rnx",
  }

  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(spec|features)/}) }
  end

  spec.require_paths = ['lib']

  spec.add_runtime_dependency 'rails', '>= 6.0'
  spec.add_development_dependency 'bundler', '>= 2.0'
  spec.add_development_dependency 'rake', '>= 10.0'
  spec.add_development_dependency 'rspec-rails', '>= 5.0'
end
