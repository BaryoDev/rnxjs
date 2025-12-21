# rnxJS v1.0.0 Publication Checklist

> Complete package publication guide for v1.0.0 release across all package registries.

## 📦 Package Overview

| Package | Registry | Version | Status |
|---------|----------|---------|--------|
| @arnelirobles/rnxjs | npm | 1.0.0 | ✅ Ready |
| @arnelirobles/express-rnx | npm | 1.0.0 | ✅ Ready |
| django-rnx | PyPI | 1.0.0 | ✅ Ready |
| rnx_rails | RubyGems | 1.0.0 | ✅ Ready |
| arnelirobles/laravel-rnx | Packagist | — | ✅ Ready |

---

## 1. Core Package: @arnelirobles/rnxjs (npm)

### Pre-Publication Checks

- [x] Version set to 1.0.0 in `package.json`
- [x] All dist files built and committed
- [x] README.md updated with v1.0.0 features
- [x] LICENSE file present and correct (MPL-2.0)
- [x] .npmignore configured to exclude dev files
- [x] package.json has correct metadata
- [x] All tests passing (600+ tests)

### Package Contents

```
dist/
├── rnx.global.js
├── rnx.esm.js
├── rnx.umd.js
└── rnx.d.ts
css/
├── bootstrap-m3-theme.css
├── bootstrap-m3-dark-theme.css
└── themes/
index.js
index.d.ts
package.json
README.md
LICENSE
```

### Publication Command

```bash
cd /path/to/rnxjs
npm publish
```

### Post-Publication Verification

```bash
npm view @arnelirobles/rnxjs@1.0.0
npm view @arnelirobles/rnxjs versions
```

---

## 2. Express Integration: @arnelirobles/express-rnx (npm)

### Pre-Publication Checks

- [x] Version set to 1.0.0 in `package.json`
- [x] Express peer dependency: `"express": ">=4.0.0"`
- [x] Node requirement: `"engines": {"node": ">=12.0.0"}`
- [x] License: MPL-2.0
- [x] Entry point: `src/index.js`
- [x] Files included in `.files` array
- [x] README.md present with usage examples
- [x] Unit tests passing

### Package Contents

```
packages/express-rnx/
├── src/
│   ├── index.js
│   ├── middleware.js
│   └── helpers.js
├── tests/
├── package.json
├── README.md
└── LICENSE
```

### Publication Command

```bash
cd packages/express-rnx
npm publish
```

### Post-Publication Verification

```bash
npm view @arnelirobles/express-rnx@1.0.0
npm search rnxjs express
```

---

## 3. Django Integration: django-rnx (PyPI)

### Pre-Publication Checks

- [x] Version set to 1.0.0 in `setup.py`
- [x] Package name: `django-rnx` (PyPI convention: lowercase with hyphens)
- [x] Python requirement: `>=3.8`
- [x] Django support: 3.2, 4.0, 4.1, 4.2, 5.0
- [x] License: MPL-2.0 in classifiers
- [x] Development Status: 5 - Production/Stable
- [x] long_description_content_type: `text/markdown`
- [x] README.md present and in `long_description`
- [x] Tests passing

### Package Contents

```
packages/django-rnx/
├── django_rnx/
│   ├── __init__.py
│   ├── template_tags/
│   ├── static/
│   └── tests/
├── setup.py
├── setup.cfg
├── README.md
├── LICENSE
└── MANIFEST.in
```

### Pre-Publication Setup

First time PyPI setup (required):

```bash
# 1. Ensure you have a PyPI account at https://pypi.org
# 2. Create ~/.pypirc with your credentials:

[distutils]
index-servers = pypi

[pypi]
repository = https://upload.pypi.org/legacy/
username = __token__
password = pypi-AgEIcHlwaS5vcmc... (your API token)

# 3. Ensure build tools are installed:
pip install build twine
```

### Publication Commands

```bash
cd packages/django-rnx

# Build the distribution
python -m build

# Check the build (optional)
twine check dist/*

# Upload to PyPI
twine upload dist/*

# Or for test PyPI first:
twine upload --repository testpypi dist/*
```

### Post-Publication Verification

```bash
# Wait 1-2 minutes for PyPI to process, then:
pip install django-rnx==1.0.0
pip index versions django-rnx
```

---

## 4. Rails Integration: rnx_rails (RubyGems)

### Pre-Publication Checks

- [x] Version set to 1.0.0 in `lib/rnx_rails/version.rb`
- [x] Gem name: `rnx_rails` (RubyGems convention: snake_case)
- [x] Ruby requirement: `>= 2.7`
- [x] Rails requirement: `>= 6.0`
- [x] License: MPL-2.0
- [x] Metadata includes all URIs (homepage, source_code, changelog, bug_tracker, documentation)
- [x] .gemspec uses `git ls-files` for files
- [x] README.md present
- [x] Tests passing

### Package Contents

```
packages/rails-rnx/
├── lib/
│   ├── rnx_rails.rb
│   ├── rnx_rails/
│   │   ├── version.rb
│   │   ├── engine.rb
│   │   └── helpers.rb
│   └── generators/
├── app/
├── spec/
├── rnx_rails.gemspec
├── README.md
└── LICENSE
```

### Pre-Publication Setup

First time RubyGems setup (required):

```bash
# 1. Create RubyGems account at https://rubygems.org
# 2. Run from your home directory once:
curl -u your_rubygems_username https://rubygems.org/api/v1/api_key.yaml > ~/.gem/credentials
chmod 0600 ~/.gem/credentials

# 3. Ensure gem tools are installed:
gem install bundler rake
```

### Publication Commands

```bash
cd packages/rails-rnx

# Build the gem
gem build rnx_rails.gemspec

# Push to RubyGems
gem push rnx_rails-1.0.0.gem

# Or with owner verification:
gem push rnx_rails-1.0.0.gem --key default --host https://rubygems.org
```

### Post-Publication Verification

```bash
# Wait 1-2 minutes for RubyGems to process, then:
gem search rnx_rails
gem install rnx_rails -v 1.0.0
```

---

## 5. Laravel Integration: arnelirobles/laravel-rnx (Packagist)

### Pre-Publication Checks

- [x] Package name: `arnelirobles/laravel-rnx` (Packagist convention)
- [x] Type: `library`
- [x] License: MPL-2.0
- [x] PHP requirement: `^8.0`
- [x] Laravel support: 8.0, 9.0, 10.0, 11.0
- [x] PSR-4 autoloading configured
- [x] Service provider registered in `extra.laravel.providers`
- [x] README.md present
- [x] GitHub repository is public

### Package Contents

```
packages/laravel-rnx/
├── src/
│   ├── RnxServiceProvider.php
│   ├── RnxBladeHelper.php
│   └── ...
├── config/
│   └── rnx.php
├── resources/
│   └── views/
├── tests/
├── composer.json
├── README.md
└── LICENSE
```

### Pre-Publication Setup

**No pre-publication setup required for Packagist.** Packagist auto-syncs from GitHub.

### Publication Steps

1. **Ensure GitHub repository is public** ✅
2. **Submit repository to Packagist:**
   - Go to https://packagist.org/packages/submit
   - Enter: `https://github.com/arnelirobles/rnxjs`
   - Click "Check"
   - If already listed, it auto-syncs

3. **Verify tags are pushed to GitHub:**
   ```bash
   git tag -l v1.0.0
   git push origin --tags
   ```

### Post-Publication Verification

```bash
# Visit the package page:
# https://packagist.org/packages/arnelirobles/laravel-rnx

# Or search:
composer search rnx laravel

# Install to verify:
composer require arnelirobles/laravel-rnx:^1.0
```

---

## 📋 Publication Sequence

### Recommended Order

1. **npm packages first** (fastest propagation)
   - @arnelirobles/rnxjs
   - @arnelirobles/express-rnx

2. **PyPI second** (2-3 minute processing)
   - django-rnx

3. **RubyGems third** (2-3 minute processing)
   - rnx_rails

4. **Packagist last** (auto-syncs, no action needed)
   - Git tags should already be pushed

### Timing Considerations

- npm: Available in ~2-5 minutes
- PyPI: Available in ~2-3 minutes after upload
- RubyGems: Available in ~2-3 minutes after push
- Packagist: Auto-updates when tags are pushed to GitHub (can be up to 12 hours for visibility in searches, but package resolves immediately)

---

## ✅ Pre-Publication Verification Checklist

### Before Publishing ANYTHING

```bash
# 1. Verify all versions are 1.0.0
grep -r "1.0.0" package.json setup.py rnx_rails.gemspec composer.json

# 2. Verify core package is built
ls -lh dist/rnx.*.js

# 3. Run all tests
npm test  # root
cd packages/express-rnx && npm test && cd ../..
cd packages/django-rnx && python -m pytest && cd ../..
cd packages/rails-rnx && bundle exec rspec && cd ../..

# 4. Verify no uncommitted changes
git status

# 5. Verify git tags exist (if needed)
git tag -l v1.0.0

# 6. Verify licenses in all packages
grep -r "MPL-2.0" . --include="package.json" --include="setup.py" --include="*.gemspec" --include="composer.json"
```

---

## 🔑 Authentication Requirements

### npm (NPM_TOKEN)

```bash
# One-time setup:
npm login

# Or use token:
npm set //registry.npmjs.org/:_authToken=$NPM_TOKEN
```

### PyPI (PYPI_PASSWORD or PYPI_API_TOKEN)

```bash
# Configure in ~/.pypirc (see section 3)
# Or use environment:
export TWINE_USERNAME=__token__
export TWINE_PASSWORD=pypi-AgEIcHlwaS5vcmc...
```

### RubyGems (GEM_HOST_API_KEY)

```bash
# Stored in ~/.gem/credentials
# Or use environment:
export GEM_HOST_API_KEY=your_api_key
```

### GitHub (for Packagist)

```bash
# Only needs public repository access (no token needed)
# Already configured in composer.json
```

---

## 🎯 Completion Criteria

### For Each Package

- [ ] Version is 1.0.0
- [ ] All tests passing
- [ ] License is MPL-2.0
- [ ] README.md has usage examples
- [ ] Dependencies are correctly specified
- [ ] No uncommitted changes in git
- [ ] Published to correct registry
- [ ] Package is installable from registry
- [ ] Verify command succeeds

### Overall Release

- [ ] @arnelirobles/rnxjs v1.0.0 published to npm
- [ ] @arnelirobles/express-rnx v1.0.0 published to npm
- [ ] django-rnx v1.0.0 published to PyPI
- [ ] rnx_rails v1.0.0 published to RubyGems
- [ ] arnelirobles/laravel-rnx v1.0.0 auto-synced on Packagist
- [ ] git tag `v1.0.0` pushed to GitHub
- [ ] All packages resolving correctly from registries
- [ ] v1.0.0 release notes published
- [ ] Blog post live at /docs/BLOG-V1.0.0.md

---

## 📚 Documentation Links

- [Quick Start Guide](./QUICK-START.md)
- [API Reference](./API.md)
- [Component Library](./COMPONENTS.md)
- [Migration Guide](./MIGRATION.md)
- [Benchmarks](./BENCHMARKS.md)
- [Release Blog Post](./BLOG-V1.0.0.md)

---

## 🚀 Ready to Publish

All packages are verified and ready for v1.0.0 publication. Follow the sequence in **Publication Sequence** section above.

**Last Updated:** December 26, 2025
**Next Review:** After successful publication
