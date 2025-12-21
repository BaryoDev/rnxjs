# Admin Dashboard - rnxJS

A fully-functional admin dashboard built with rnxJS showcasing all Phase 1 components.

## 🚀 Quick Start

```bash
# Development server
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📦 Features

This dashboard template demonstrates:

- **TopAppBar** - Header navigation
- **Breadcrumb** - Navigation path
- **StatCard** - Metric displays with trends (4 cards)
- **DataTable** - Sortable, filterable, paginated user table
- **Container/Row/Column** - Responsive layout system

## 🎨 Components Used

### StatCards
- Total Users (primary)
- Revenue (success)
- Orders (info)
- Conversion Rate (warning)

Each card shows:
- Icon
- Label
- Value
- Trend indicator (↑ or ↓)
- Change percentage

### DataTable
- 8 mock users with real data
- Columns: ID, Name, Email, Role, Status
- Sortable columns (click header)
- Global search filtering
- Row selection (checkboxes)
- Pagination (5 rows per page)
- Callbacks for sort, filter, selection changes

### Responsive Design
- Mobile-optimized
- Breakpoints at 768px
- Touch-friendly controls
- Readable typography

## 📊 Mock Data

The dashboard includes 8 sample users:
- Different roles (Admin, User, Moderator)
- Multiple statuses (Active, Inactive, Pending)
- Real-looking email addresses

## 🛠️ Customization

### Modify Statistics
Edit `src/main.js` to change StatCard values:

```javascript
StatCard({
    label: 'Your Metric',
    value: '123',
    icon: 'bi-icon-name',
    variant: 'success'
})
```

### Add More Users
Add entries to the `mockUsers` array in `src/main.js`:

```javascript
{
    id: 9,
    name: 'New User',
    email: 'user@example.com',
    role: 'User',
    status: 'Active'
}
```

### Connect to Real API
Replace mock data with API calls:

```javascript
const response = await fetch('/api/users');
const mockUsers = await response.json();
```

### Styling
Customize colors in `src/styles.css`:

```css
:root {
  --primary-color: #0b57d0;
  --success-color: #0f9e6e;
  --danger-color: #d92b2b;
}
```

## 📚 Next Steps

1. **Add More Pages** - Create additional dashboard pages
2. **Connect Backend** - Integrate with your API
3. **Real-Time Data** - Add WebSocket for live updates
4. **Dark Mode** - Implement theme switching
5. **Authentication** - Add login/logout flow

## 🔗 Component Documentation

For detailed component documentation, see:
- [@arnelirobles/rnxjs GitHub](https://github.com/arnelirobles/rnxjs)
- [Component README Files](../../components/)

## 📄 License

MPL-2.0 (see main rnxjs repo)
