export type AnyData = Record<string, unknown>;

export interface ColumnDef<TData extends AnyData> {
  id: string;
  accessorKey?: keyof TData;
  header?: string;
  cell?: (info: { value: unknown; row: TData }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

export interface TableOptions<TData extends AnyData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialState?: {
    sorting?: { id: string; desc: boolean }[];
    pagination?: { pageIndex: number; pageSize: number };
  };
}

export interface TableInstance<TData extends AnyData> {
  getColumns: () => ColumnDef<TData>[];
  getData: () => TData[];
  getState: () => TableState;
  setState: (updater: (state: TableState) => TableState) => void;
}

export interface TableState {
  sorting: { id: string; desc: boolean }[];
  pagination: { pageIndex: number; pageSize: number };
} 