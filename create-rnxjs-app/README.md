# create-rnxjs-app

The official scaffolding tool for [rnxJS](https://www.npmjs.com/package/@arnelirobles/rnxjs).

Quickly bootstrap a new rnxJS application with interactive template selection and framework configuration.

## 🚀 Usage

With **npm**:

```bash
npm create @arnelirobles/rnxjs-app@latest
# OR
npx @arnelirobles/create-rnxjs-app@latest
```

With **yarn**:

```bash
yarn create @arnelirobles/rnxjs-app
```

With **pnpm**:

```bash
pnpm create @arnelirobles/rnxjs-app
```

## 📋 Interactive Setup

The CLI will prompt you for:

1. **Project Name**: Your application name (must be alphanumeric with dashes/underscores)
2. **Template Selection**: Choose from 4 templates
3. **CSS Framework**: Bootstrap 5 (recommended), Tailwind, or None
4. **Backend Integration**: None, Django, Rails, or Laravel
5. **Git Repository**: Initialize git with first commit

## 🎯 Available Templates

### Blank (Recommended)
Minimal starter with imports and basic setup. Perfect for custom projects.

### Dashboard
Full admin dashboard showcasing all Phase 1 components:
- StatCard (4 metrics with trends)
- DataTable (sortable, filterable, paginated)
- TopAppBar
- Breadcrumb navigation
- Responsive layout
- 8 mock users for demo

**Perfect for**: Admin panels, internal tools, dashboards

### Landing Page
Marketing landing page template with:
- Hero section with CTA buttons
- Features showcase (3 feature cards)
- Call-to-action section
- Footer with links
- Responsive design

**Perfect for**: Marketing sites, product pages, portfolios

### Multi-Step Form
Interactive form wizard with 3 steps:
- Step 1: Personal information
- Step 2: Address information
- Step 3: Review & submit
- Form validation
- Step indicators
- Back/Next navigation

**Perfect for**: Onboarding, registration, surveys, questionnaires

## 🛠 Framework Options

### CSS Framework
- **Bootstrap 5** (Recommended): Full Bootstrap with utilities and components
- **Tailwind CSS**: Utility-first approach with customization
- **None**: No CSS framework, use your own

### Backend Integration
- **None** (Default): Frontend-only project
- **Django**: Python backend with API setup instructions
- **Rails**: Ruby on Rails backend with API setup instructions
- **Laravel**: PHP Laravel backend with API setup instructions

## 📦 Project Structure

```
my-app/
├── src/
│   ├── main.js          # Entry point (varies by template)
│   └── styles.css       # Component styles
├── index.html           # Main HTML file
├── jsconfig.json        # Intellisense configuration
├── package.json         # Dependencies
├── _gitignore           # Git ignore rules
└── README.md            # Template documentation
```

## ✨ What's Included

- **rnxJS v0.4.0+**: Core framework with Phase 1 components
- **Bootstrap 5/Tailwind**: CSS framework (configurable)
- **jsconfig.json**: Excellent VS Code intellisense
- **Template-specific content**: Ready-to-use starting code
- **Git initialization**: Optional first commit

## 🚀 Next Steps

After scaffolding:

```bash
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000` (or your dev server URL).

## 🔧 Customization

Each template includes:
- Complete source code you own
- Documented components
- Example styling and structure
- Comments for easy customization

## 📚 Resources

- [rnxJS Documentation](https://github.com/arnelirobles/rnxjs)
- [Component Library](https://github.com/arnelirobles/rnxjs/tree/main/components)
- [Examples](https://github.com/arnelirobles/rnxjs/tree/main/examples)

## 🤝 Contributing

Issues and PRs welcome! Please see [main rnxJS repo](https://github.com/arnelirobles/rnxjs) for guidelines.

## 📄 License

MPL-2.0

---

**Happy building! 🎉**

Start with a template and customize to your needs. All templates are designed to be extended and modified.
