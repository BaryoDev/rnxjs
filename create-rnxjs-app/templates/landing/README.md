# Landing Page - rnxJS

A beautiful, responsive landing page template built with rnxJS.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📄 Page Structure

The landing page includes:

### Hero Section
- Large headline
- Subheading
- Call-to-action buttons

### Features Section
- 3 feature cards:
  - Lightning Fast
  - Component Library
  - Secure by Default
- Hover animations

### Call-to-Action Section
- Headline
- Primary CTA button

### Footer
- Navigation links
- Social links
- Copyright

## 🎨 Customization

### Change Colors
Edit `src/styles.css`:

```css
:root {
  --primary-color: #0b57d0;
  --primary-dark: #0847ab;
}
```

### Update Text
Edit `src/main.js` to change headlines, descriptions, and copy.

### Add More Sections
Add new components to `src/main.js`:

```javascript
const newSection = Container({
    className: 'my-section py-5',
    children: [
        Row({
            children: [
                Column({
                    children: [/* content */]
                })
            ]
        })
    ]
});

app.appendChild(newSection);
```

## 📱 Responsive Design

The landing page is fully responsive:
- Mobile-first approach
- Touch-friendly buttons
- Stacked layout on small screens
- Optimized typography for all screen sizes

## 🔗 Components Used

- Container
- Row & Column
- Card
- Button
- TopAppBar
- Custom HTML for flexible content

## 📚 Next Steps

1. **Replace placeholder text** with your own content
2. **Update colors** to match your brand
3. **Add contact form** using the Form components
4. **Integrate analytics** for tracking
5. **Connect social links** to your profiles
6. **Add animations** and transitions
7. **SEO optimization** (meta tags, structured data)

## 🏗️ Add More Sections

Common sections to add:

```javascript
// Pricing
const pricing = Container({
    // pricing cards
});

// Testimonials
const testimonials = Container({
    // testimonial cards
});

// Blog
const blog = Container({
    // blog post previews
});
```

## 📄 License

MPL-2.0 (see main rnxjs repo)
