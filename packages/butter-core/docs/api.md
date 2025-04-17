# Butter-Core API Documentation

## Table of Contents
- [Core Types](#core-types)
- [Table Options](#table-options)
- [Column Definition](#column-definition)
- [Filtering](#filtering)
- [Virtualization](#virtualization)
- [Export](#export)

## Core Types

### `AnyData`
```typescript
type AnyData = Record<string, unknown>;
```
Base type for table data. All data passed to the table must extend this type.

### `TableState`
```typescript
interface TableState {
  sorting: { id: string; desc: boolean }[];
  pagination: { pageIndex: number; pageSize: number };
  filters: FilterState[];
  globalFilter: GlobalFilterState | null;
  selection: string[];
  columnOrder: string[];
  columnSizes: Record<string, number>;
  pinnedColumns: {
    left: string[];
    right: string[];
  };
  columnVisibility: Record<string, boolean>;
  serverState: ServerState;
}
```

## Table Options

### `TableOptions<TData>`
```typescript
interface TableOptions<TData extends AnyData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  tableId: string;
  serverOptions?: ServerOptions<TData>;
  initialState?: {
    sorting?: { id: string; desc: boolean }[];
    pagination?: { pageIndex: number; pageSize: number };
    filters?: FilterState[];
    globalFilter?: GlobalFilterState;
    selection?: string[];
    columnOrder?: string[];
    columnSizes?: Record<string, number>;
    pinnedColumns?: {
      left?: string[];
      right?: string[];
    };
    columnVisibility?: Record<string, boolean>;
  };
}
```

## Column Definition

### `ColumnDef<TData>`
```typescript
interface ColumnDef<TData> {
  id: string;
  header: string;
  accessorKey?: keyof TData;
  accessorFn?: (row: TData) => any;
  filterFn?: (value: any, filterValue: any, operator: FilterOperator) => boolean;
  sortFn?: (a: any, b: any) => number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  reorderable?: boolean;
  pinned?: 'left' | 'right' | false;
  exportValue?: (row: TData) => string | number | boolean | null | undefined;
  filterable?: boolean;
  searchable?: boolean;
}
```

## Filtering

### Filter Operators
```typescript
type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull';
```

### Filter Methods
```typescript
interface TableInstance<TData> {
  // Filtering methods
  setGlobalFilter: (value: string) => void;
  setColumnFilter: (columnId: string, value: unknown, operator: FilterOperator) => void;
  clearFilters: () => void;
  clearColumnFilter: (columnId: string) => void;
  getFilteredColumns: () => ColumnDef<TData>[];
  getSearchableColumns: () => ColumnDef<TData>[];
  getFilteredData: () => TData[];
}
```

## Virtualization

### `VirtualInstance`
```typescript
interface VirtualInstance {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  measure: () => void;
}
```

## Export

### `ExportOptions`
```typescript
interface ExportOptions {
  format: 'csv' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
  columns?: string[];
}
```

### Export Methods
```typescript
interface TableInstance<TData> {
  exportData: (options: ExportOptions) => Promise<void>;
}
```

## Server-Side Operations

### `ServerOptions<TData>`
```typescript
interface ServerOptions<TData> {
  fetchData: (params: {
    pageIndex: number;
    pageSize: number;
    sorting: { id: string; desc: boolean }[];
    filters: FilterState[];
  }) => Promise<{
    data: TData[];
    totalCount: number;
    pageCount: number;
  }>;
  initialData?: TData[];
  keepPreviousData?: boolean;
  staleTime?: number;
  cacheTime?: number;
}
```

### Server Methods
```typescript
interface TableInstance<TData> {
  fetchData: () => Promise<void>;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  invalidateQueries: () => void;
  getServerState: () => ServerState;
}
``` 