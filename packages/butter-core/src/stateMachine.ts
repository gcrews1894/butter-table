import type { TableState, FilterState, GlobalFilterState } from './types';

export type TableAction =
  | { type: 'SET_SORTING'; payload: { id: string; desc: boolean }[] }
  | { type: 'SET_PAGINATION'; payload: { pageIndex: number; pageSize: number } }
  | { type: 'SET_FILTERS'; payload: FilterState[] }
  | { type: 'SET_GLOBAL_FILTER'; payload: GlobalFilterState }
  | { type: 'SET_COLUMN_FILTER'; payload: FilterState }
  | { type: 'CLEAR_FILTERS'; payload: null }
  | { type: 'CLEAR_COLUMN_FILTER'; payload: string }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'SET_COLUMN_ORDER'; payload: string[] }
  | { type: 'SET_COLUMN_SIZE'; payload: { columnId: string; width: number } }
  | { type: 'SET_PINNED_COLUMN'; payload: { columnId: string; position: 'left' | 'right' | false } }
  | { type: 'TOGGLE_COLUMN_VISIBILITY'; payload: string }
  | { type: 'SET_SERVER_STATE'; payload: { isLoading: boolean; isFetching: boolean; error: Error | null; totalCount: number; pageCount: number } };

export function createTableState(initialState: Partial<TableState>): TableState {
  return {
    sorting: initialState.sorting || [],
    pagination: initialState.pagination || { pageIndex: 0, pageSize: 10 },
    filters: initialState.filters || [],
    globalFilter: initialState.globalFilter || null,
    selection: initialState.selection || [],
    columnOrder: initialState.columnOrder || [],
    columnSizes: initialState.columnSizes || {},
    pinnedColumns: {
      left: initialState.pinnedColumns?.left || [],
      right: initialState.pinnedColumns?.right || [],
    },
    columnVisibility: initialState.columnVisibility || {},
    serverState: {
      isLoading: false,
      isFetching: false,
      error: null,
      totalCount: 0,
      pageCount: 0,
    },
  };
}

export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'SET_SORTING':
      return { ...state, sorting: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_GLOBAL_FILTER':
      return { ...state, globalFilter: action.payload };
    case 'SET_COLUMN_FILTER': {
      const existingFilterIndex = state.filters.findIndex(f => f.id === action.payload.id);
      if (existingFilterIndex >= 0) {
        const newFilters = [...state.filters];
        newFilters[existingFilterIndex] = action.payload;
        return { ...state, filters: newFilters };
      }
      return { ...state, filters: [...state.filters, action.payload] };
    }
    case 'CLEAR_FILTERS':
      return { ...state, filters: [], globalFilter: null };
    case 'CLEAR_COLUMN_FILTER':
      return { ...state, filters: state.filters.filter(f => f.id !== action.payload) };
    case 'SET_SELECTION':
      return { ...state, selection: action.payload };
    case 'SET_COLUMN_ORDER':
      return { ...state, columnOrder: action.payload };
    case 'SET_COLUMN_SIZE':
      return {
        ...state,
        columnSizes: { ...state.columnSizes, [action.payload.columnId]: action.payload.width },
      };
    case 'SET_PINNED_COLUMN': {
      const { columnId, position } = action.payload;
      const left = position === 'left' 
        ? [...state.pinnedColumns.left, columnId]
        : state.pinnedColumns.left.filter(id => id !== columnId);
      const right = position === 'right'
        ? [...state.pinnedColumns.right, columnId]
        : state.pinnedColumns.right.filter(id => id !== columnId);
      return {
        ...state,
        pinnedColumns: { left, right },
      };
    }
    case 'TOGGLE_COLUMN_VISIBILITY': {
      const columnId = action.payload;
      return {
        ...state,
        columnVisibility: {
          ...state.columnVisibility,
          [columnId]: !state.columnVisibility[columnId],
        },
      };
    }
    case 'SET_SERVER_STATE':
      return { ...state, serverState: action.payload };
    default:
      return state;
  }
} 