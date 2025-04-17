import type { VirtualInstance } from '@butter-table/butter-virtual';

export type AnyData = Record<string, unknown>;

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  columns?: string[]; // Column IDs to include in export
}

export type FilterOperator = 
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

export interface FilterState {
  id: string;
  value: unknown;
  operator: FilterOperator;
  isGlobal?: boolean; // Indicates if this is a global filter
}

export interface GlobalFilterState {
  value: string;
  columns: string[]; // Column IDs to search in
}

export interface ColumnDef<TData> {
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
  filterable?: boolean; // Whether the column can be filtered
  searchable?: boolean; // Whether the column can be included in global search
}

export interface ServerState {
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  totalCount: number;
  pageCount: number;
}

export interface ServerOptions<TData> {
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

export interface TableOptions<TData extends AnyData> {
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

export interface TableInstance<TData> {
  getState: () => TableState;
  getColumns: () => ColumnDef<TData>[];
  getSortedData: () => TData[];
  getFilteredData: () => TData[];
  getSelectedRows: () => TData[];
  toggleRowSelection: (id: string) => void;
  resizeColumn: (columnId: string, width: number) => void;
  reorderColumn: (sourceId: string, targetId: string) => void;
  pinColumn: (columnId: string, position: 'left' | 'right' | false) => void;
  getPinnedColumns: (position: 'left' | 'right') => ColumnDef<TData>[];
  getUnpinnedColumns: () => ColumnDef<TData>[];
  toggleColumnVisibility: (columnId: string) => void;
  getVisibleColumns: () => ColumnDef<TData>[];
  tableId: string;
  // Server-side methods
  fetchData: () => Promise<void>;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  invalidateQueries: () => void;
  getServerState: () => ServerState;
  // Virtualization methods
  getVirtualizer: () => VirtualInstance;
  // Export methods
  exportData: (options: ExportOptions) => Promise<void>;
  // Filtering methods
  setGlobalFilter: (value: string) => void;
  setColumnFilter: (columnId: string, value: unknown, operator: FilterOperator) => void;
  clearFilters: () => void;
  clearColumnFilter: (columnId: string) => void;
  getFilteredColumns: () => ColumnDef<TData>[];
  getSearchableColumns: () => ColumnDef<TData>[];
}

export interface VirtualItem<TData> {
  index: number;
  data: TData;
  start: number;
  end: number;
  size: number;
}

export interface TableState {
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