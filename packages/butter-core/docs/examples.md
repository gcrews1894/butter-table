# Butter-Core Usage Examples

## Basic Table Setup

```typescript
import { createTable } from '@butter-table/butter-core';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive';
}

const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'inactive' },
];

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterable: true,
    searchable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    filterable: true,
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterable: true,
    filterFn: (value, filterValue, operator) => {
      switch (operator) {
        case 'greaterThan':
          return value > Number(filterValue);
        case 'lessThan':
          return value < Number(filterValue);
        default:
          return true;
      }
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    filterable: true,
  },
];

const table = createTable<User>({
  data,
  columns,
  tableId: 'users-table',
});
```

## Filtering Examples

### Global Search
```typescript
// Search across all searchable columns
table.setGlobalFilter('john');

// Get filtered data
const filteredData = table.getFilteredData();
```

### Column Filtering
```typescript
// Filter users older than 25
table.setColumnFilter('age', 25, 'greaterThan');

// Filter active users
table.setColumnFilter('status', 'active', 'equals');

// Filter users with email containing '@example'
table.setColumnFilter('email', '@example', 'contains');

// Clear all filters
table.clearFilters();

// Clear specific column filter
table.clearColumnFilter('age');
```

## Export Examples

```typescript
// Export to CSV
await table.exportData({
  format: 'csv',
  filename: 'users',
  includeHeaders: true,
});

// Export to Excel with specific columns
await table.exportData({
  format: 'xlsx',
  filename: 'users-filtered',
  columns: ['name', 'email', 'status'],
});
```

## Server-Side Operations

```typescript
const table = createTable<User>({
  data: [],
  columns,
  tableId: 'users-table',
  serverOptions: {
    fetchData: async ({ pageIndex, pageSize, sorting, filters }) => {
      // Convert filters to API parameters
      const params = new URLSearchParams({
        page: String(pageIndex + 1),
        pageSize: String(pageSize),
        sort: sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(','),
        ...filters.reduce((acc, filter) => ({
          ...acc,
          [`filter[${filter.id}]`]: String(filter.value),
        }), {}),
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      return {
        data: result.data,
        totalCount: result.total,
        pageCount: Math.ceil(result.total / pageSize),
      };
    },
    initialData: [],
    keepPreviousData: true,
  },
});

// Fetch first page
await table.fetchData();

// Change page
table.setPageIndex(1);

// Change page size
table.setPageSize(20);

// Invalidate cache and refetch
table.invalidateQueries();
```

## Custom Column Rendering

```typescript
const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    exportValue: (row) => `${row.lastName}, ${row.firstName}`,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    filterFn: (value, filterValue, operator) => {
      // Custom status filtering logic
      if (operator === 'equals') {
        return value === filterValue;
      }
      if (operator === 'notEquals') {
        return value !== filterValue;
      }
      return true;
    },
  },
];
```

## Column Management

```typescript
// Get all columns
const allColumns = table.getColumns();

// Get filterable columns
const filterableColumns = table.getFilteredColumns();

// Get searchable columns
const searchableColumns = table.getSearchableColumns();

// Toggle column visibility
table.toggleColumnVisibility('email');

// Get visible columns
const visibleColumns = table.getVisibleColumns();

// Pin column to left
table.pinColumn('name', 'left');

// Get pinned columns
const leftPinnedColumns = table.getPinnedColumns('left');
const unpinnedColumns = table.getUnpinnedColumns();
``` 