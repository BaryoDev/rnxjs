import {
    Container,
    Row,
    Column,
    StatCard,
    DataTable,
    Breadcrumb,
    Card,
    TopAppBar,
    Button
} from '@arnelirobles/rnxjs';

// Mock data for dashboard
const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
    { id: 6, name: 'Diana Wilson', email: 'diana@example.com', role: 'User', status: 'Active' },
    { id: 7, name: 'Eve Martinez', email: 'eve@example.com', role: 'User', status: 'Pending' },
    { id: 8, name: 'Frank Garcia', email: 'frank@example.com', role: 'Moderator', status: 'Active' },
];

// Top navigation
const topAppBar = TopAppBar({
    title: 'Dashboard',
    subtitle: 'Welcome back!',
    icon: 'bi-speedometer2'
});

// Breadcrumb navigation
const breadcrumb = Breadcrumb({
    items: [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard', active: true }
    ]
});

// Stats cards
const statsRow = Row({
    children: [
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Total Users',
                    value: mockUsers.length.toString(),
                    icon: 'bi-people',
                    change: { value: 12, trend: 'up' },
                    variant: 'primary'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Revenue',
                    value: '$45,231',
                    icon: 'bi-cash-coin',
                    change: { value: 8.2, trend: 'up' },
                    variant: 'success'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Orders',
                    value: '127',
                    icon: 'bi-box-seam',
                    change: { value: 3.5, trend: 'up' },
                    variant: 'info'
                })
            ]
        }),
        Column({
            md: 3,
            children: [
                StatCard({
                    label: 'Conversion',
                    value: '3.2%',
                    icon: 'bi-graph-up',
                    change: { value: 0.5, trend: 'down' },
                    variant: 'warning'
                })
            ]
        })
    ]
});

// Data table
const dataTable = DataTable({
    columns: [
        { key: 'id', label: 'ID', sortable: true, width: '60px' },
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'email', label: 'Email', sortable: true, filterable: true },
        { key: 'role', label: 'Role', sortable: true, filterable: true },
        { key: 'status', label: 'Status' }
    ],
    rows: mockUsers,
    pageSize: 5,
    sortable: true,
    filterable: true,
    selectable: true,
    onSort: (column, direction) => {
        console.log(`Sorted by ${column} (${direction})`);
    },
    onFilter: (query) => {
        console.log(`Filtered by: ${query}`);
    },
    onPageChange: (page) => {
        console.log(`Page changed to: ${page}`);
    },
    onSelectionChange: (selected) => {
        console.log(`Selected rows: ${selected.length}`);
    }
});

// Main container
const dashboard = Container({
    className: 'py-5',
    children: [
        topAppBar,
        breadcrumb,
        Row({
            children: [
                Column({
                    children: [
                        breadcrumb
                    ]
                })
            ]
        }),
        Row({
            className: 'my-4',
            children: [
                Column({
                    children: [statsRow]
                })
            ]
        }),
        Row({
            children: [
                Column({
                    children: [
                        Card({
                            title: 'Users',
                            children: [dataTable]
                        })
                    ]
                })
            ]
        })
    ]
});

// Mount to app
const app = document.getElementById('app');
app.appendChild(dashboard);

console.log('🚀 Dashboard loaded successfully!');
