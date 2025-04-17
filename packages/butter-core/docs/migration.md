# Migration Guide

## From v1 to v2

### Breaking Changes

1. **Virtualization Changes**
   - Removed custom virtualization implementation
   - Now uses `@butter-table/butter-virtual` package
   - `getVirtualizer` now returns `VirtualInstance` instead of `Virtualizer`

2. **State Management**
   - Removed `getData` method
   - State is now managed through `options.data`
   - All data operations (sorting, filtering) now work directly on `options.data`

3. **Filtering**
   - Filter operators are now more strictly typed
   - Numeric comparisons require explicit number conversion
   - Custom filter functions must handle type conversion

### Migration Steps

1. **Update Dependencies**
```bash
npm install @butter-table/butter-virtual@latest
```

2. **Update Virtualization Usage**
```typescript
// Before
const virtualizer = table.getVirtualizer();

// After
const virtualizer = table.getVirtualizer();
// Use VirtualInstance methods instead of Virtualizer
```

3. **Update Data Access**
```typescript
// Before
const data = table.getData();

// After
const data = table.options.data;
```

4. **Update Filter Functions**
```typescript
// Before
filterFn: (value, filterValue) => value > filterValue

// After
filterFn: (value, filterValue, operator) => {
  const numValue = Number(value);
  const numFilterValue = Number(filterValue);
  switch (operator) {
    case 'greaterThan':
      return numValue > numFilterValue;
    // ... other cases
  }
}
```

## From v2 to v3

### Breaking Changes

1. **Export Functionality**
   - Added new export methods
   - Changed export options structure
   - Added web worker support for XLSX export

2. **Server-Side Operations**
   - Added pagination support
   - Added sorting and filtering support
   - Added caching options

### Migration Steps

1. **Update Export Usage**
```typescript
// Before
table.exportToCSV();

// After
await table.exportData({
  format: 'csv',
  filename: 'data',
  includeHeaders: true,
});
```

2. **Update Server-Side Usage**
```typescript
// Before
const table = createTable({
  data: [],
  columns,
});

// After
const table = createTable({
  data: [],
  columns,
  serverOptions: {
    fetchData: async ({ pageIndex, pageSize, sorting, filters }) => {
      // Implement data fetching
    },
    initialData: [],
    keepPreviousData: true,
  },
});
```

## Common Issues and Solutions

1. **Type Errors in Filter Functions**
```typescript
// Error: Type 'unknown' is not comparable
filterFn: (value, filterValue) => value > filterValue

// Solution: Add type conversion
filterFn: (value, filterValue, operator) => {
  const numValue = Number(value);
  const numFilterValue = Number(filterValue);
  return numValue > numFilterValue;
}
```

2. **Virtualization Not Working**
```typescript
// Error: Virtualizer is null
const virtualizer = table.getVirtualizer();

// Solution: Ensure proper initialization
const virtualizer = table.getVirtualizer();
if (virtualizer) {
  // Use virtualizer methods
}
```

3. **Export Failing**
```typescript
// Error: Export worker not found
await table.exportData({ format: 'xlsx' });

// Solution: Add worker configuration
await table.exportData({
  format: 'xlsx',
  workerUrl: '/path/to/worker.js',
});
```

## Performance Tips

1. **Memoize Expensive Computations**
```typescript
const table = createTable({
  data,
  columns,
  memoize: true, // Enable memoization
});
```

2. **Use Batch Updates**
```typescript
// Before
table.setPageIndex(1);
table.setPageSize(20);
table.setSorting([{ id: 'name', desc: true }]);

// After
table.batchUpdates(() => {
  table.setPageIndex(1);
  table.setPageSize(20);
  table.setSorting([{ id: 'name', desc: true }]);
});
```

3. **Optimize Server-Side Operations**
```typescript
const table = createTable({
  data: [],
  columns,
  serverOptions: {
    fetchData: async (options) => {
      // Implement efficient data fetching
    },
    keepPreviousData: true, // Enable data caching
    staleTime: 5000, // Cache data for 5 seconds
  },
});
``` 