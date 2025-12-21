# Sprint 5: Quick Start Guide

## 🎯 High Priority (Start Immediately)

### 1. Plugin System (Week 1) ⭐
**Why First**: All backend integrations depend on this

Create `utils/plugins.js`:
```javascript
export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  use(plugin, options = {}) { /* register plugin */ }
  addHook(name, handler) { /* add hook handler */ }
  runHook(name, context) { /* execute hooks */ }
}

export const plugins = new PluginManager();
```

Create 3 plugins:
- `plugins/router.js` - Hash routing with `rnxRouter.push()`
- `plugins/toast.js` - Notifications with `rnx.toast.success()`
- `plugins/storage.js` - Persist state with `rnx.storage.persist()`

**Tests**: 15+ tests per plugin, covering all features

---

### 2. Django Integration (Week 2) ⭐
**Why Next**: Largest Django developer audience

Create `packages/django-rnx/`:
```
django_rnx/
├── __init__.py
├── templatetags/
│   └── rnx.py              # Template tags
├── static/                 # Bootstrap, M3 theme, rnx.global.js
└── templates/              # rnx/scripts.html
```

Template tags needed:
- `{% rnx_scripts %}` - Include rnxJS + Bootstrap
- `{% rnx_state data 'state' %}` - Create reactive state
- `{% rnx_component 'Button' variant='primary' %}`

Example Django template:
```django
{% load rnx %}
<!DOCTYPE html>
<html>
  <head>{% rnx_scripts %}</head>
  <body>
    <Container>
      <DataTable data="state.users" />
    </Container>
    {% rnx_state users_data 'state' %}
  </body>
</html>
```

---

### 3. Laravel Integration (Week 2-3)
**Why Important**: Growing Laravel community

Create `packages/laravel-rnx/`:
```
src/
├── RnxServiceProvider.php  # Service provider
├── Facades/                # Facades for helpers
└── Components/             # Blade component classes
```

Blade directives needed:
- `@rnxScripts` - Include assets
- `@rnxState($data, 'state')` - Create state
- `<x-rnx-button />` - Component

Example Blade:
```blade
@extends('layouts.app')
@section('content')
  <x-rnx-datatable :data="$users" />
  @rnxState($users, 'state')
@endsection
```

---

### 4. Rails Integration (Week 3)
**Why After Django/Laravel**: Smaller but important market

Create `packages/rails-rnx/` gem:
```
lib/
├── rnx_rails.rb           # Gem setup
├── engine.rb              # Rails engine
└── helpers.rb             # View helpers
```

Rails helpers:
- `rnx_scripts(cdn: true, theme: 'bootstrap')`
- `rnx_state(data, var_name: 'state')`
- `rnx_component(name, **props)`

---

### 5. Express Middleware (Week 3)
**Why Quick**: Simple to implement

Create `packages/rnx-express/index.js`:
```javascript
export function rnxMiddleware(options = {}) {
  return (req, res, next) => {
    res.locals.rnx = {
      scripts: () => { /* CDN or local */ },
      state: (data, varName) => { /* create state */ },
      component: (name, props) => { /* render component */ }
    };
    next();
  };
}
```

---

## 📋 Medium Priority (Weeks 4-5)

### Community Building
1. **Discord Server**
   - Create with 8-10 channels
   - Write welcome/rules
   - Post templates for Q&A

2. **GitHub Templates**
   - Already have bug_report.md, feature_request.md
   - Add discussion.md
   - Add security.md

3. **Blog Posts** (2-3 minimum)
   - "Build a CRUD Admin in 30 Minutes"
   - "Django + rnxJS Integration Guide"
   - "When to Use rnxJS"

---

## 🎁 Distribution (Week 5-6)

1. **Update package.json**
   ```json
   {
     "sideEffects": false,
     "exports": {
       ".": { "import": "./dist/rnx.esm.js" },
       "./plugins/*": "./dist/plugins/*.js",
       "./css/*": "./css/*"
     }
   }
   ```

2. **Publish Packages**
   - npm: rnxjs (already done), create-rnxjs-app (already done)
   - npm: django-rnx, laravel-rnx, rnx-express
   - PyPI: django-rnx
   - Packagist: laravel-rnx
   - RubyGems: rnx_rails
   - cdnjs: rnxjs

3. **Verify Distribution**
   ```bash
   npm install @arnelirobles/rnxjs
   npx create-rnxjs-app my-app
   curl https://cdn.jsdelivr.net/npm/@arnelirobles/rnxjs/dist/rnx.global.js
   ```

---

## 📊 Success Metrics (Track Monthly)

| Metric | Current | 6-Month | 12-Month |
|--------|---------|---------|----------|
| npm downloads/week | ? | 1,000 | 5,000 |
| GitHub stars | ? | 1,000 | 5,000 |
| Discord members | 0 | 200 | 1,000 |
| Production users | 0 | 20 | 100 |
| Contributors | 1 | 5 | 10 |

---

## 🚀 Execution Plan

### Week 1
- [ ] Implement PluginManager
- [ ] Create router plugin
- [ ] Create toast plugin
- [ ] Create storage plugin
- [ ] 10+ tests per plugin

### Week 2
- [ ] Create Django package scaffold
- [ ] Implement template tags
- [ ] Write Django example
- [ ] Write Django README

### Week 3
- [ ] Create Laravel package scaffold
- [ ] Implement service provider + directives
- [ ] Create Rails gem scaffold
- [ ] Implement Rails helpers
- [ ] Create Express middleware

### Week 4
- [ ] Set up Discord
- [ ] Write 2 blog posts
- [ ] Create GitHub templates
- [ ] Record 2 YouTube videos

### Week 5
- [ ] Update package.json exports
- [ ] Publish all packages
- [ ] Submit to registries
- [ ] Verify CDN working

### Week 6
- [ ] Collect metrics
- [ ] Announce Sprint 5 complete
- [ ] Plan v1.0.0 release

---

## 📁 Files to Create

**Essential (Week 1)**:
```
utils/plugins.js
plugins/router.js
plugins/toast.js
plugins/storage.js
css/plugins.css (toast positioning, animations)
```

**Integration Packages (Weeks 2-3)**:
```
packages/django-rnx/
packages/laravel-rnx/
packages/rails-rnx/
packages/rnx-express/
```

**Documentation**:
```
SPRINT-5-QUICK-START.md ✅ (this file)
brain/SPRINT-05-ECOSYSTEM-ANALYSIS.md ✅ (detailed)
docs/plugins/development-guide.md (how to build plugins)
```

---

## 🔗 References

- Full Analysis: `brain/SPRINT-05-ECOSYSTEM-ANALYSIS.md`
- Plugin Spec: Lines 294-657 in `brain/SPRINT-05-ECOSYSTEM.md`
- Backend Integrations: Lines 15-291 in `brain/SPRINT-05-ECOSYSTEM.md`
- Community Building: Lines 661-730 in `brain/SPRINT-05-ECOSYSTEM.md`

---

## Questions?

- **Plugin System Details**: See `SPRINT-05-ECOSYSTEM.md` lines 294-657
- **Django Integration**: See `SPRINT-05-ECOSYSTEM.md` lines 17-110
- **Laravel Integration**: See `SPRINT-05-ECOSYSTEM.md` lines 112-188
- **Rails Integration**: See `SPRINT-05-ECOSYSTEM.md` lines 190-241
- **Express Middleware**: See `SPRINT-05-ECOSYSTEM.md` lines 243-290

---

**Ready to build the ecosystem? Let's go! 🚀**
