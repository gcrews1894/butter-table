import type { AnyData, ColumnDef, TableInstance, TableOptions, TableState, FilterState, ServerState, ExportOptions, FilterOperator } from './types';
import { createTableState, tableReducer } from './stateMachine';
import { saveTableState, loadTableState } from './persistence';
import { ServerCache } from './serverCache';
import { memoize, memoizeSelector } from './memoization';
import { batchUpdates, scheduleUpdate } from './batchUpdates';
import { useVirtual } from '@butter-table/butter-virtual';
import type { VirtualInstance } from '@butter-table/butter-virtual';
import { exportData } from './export';
import {
  isValidColumnId,
  canResizeColumn,
  canReorderColumn,
  clampColumnWidth,
  moveColumn,
  toggleSort,
  createColumn,
  createFilter,
  createSort,
  getNextSortDirection,
} from './utils';

export function createTable<TData extends { id: string }>(
  options: TableOptions<TData>
): TableInstance<TData> {
  const savedState = loadTableState(options.tableId);
  
  let state = createTableState({
    ...savedState,
    ...options.initialState,
    pinnedColumns: {
      left: [],
      right: []
    },
    serverState: {
      isLoading: false,
      isFetching: false,
      error: null,
      totalCount: 0,
      pageCount: 0,
    },
    globalFilter: options.initialState?.globalFilter || null,
  });

  let columns = options.columns;
  let serverCache: ServerCache<TData> | null = null;
  let currentData: TData[] = options.data;
  
  // Initialize virtualizer with default values
  const virtualizer: VirtualInstance = {
    virtualItems: [],
    totalSize: 0,
    scrollToIndex: () => {},
    scrollToOffset: () => {},
    measure: () => {}
  };

  if (options.serverOptions) {
    serverCache = new ServerCache(options.serverOptions);
    if (options.serverOptions.initialData) {
      currentData = options.serverOptions.initialData;
    }
  }

  // Memoize expensive computations
  const getSortedData = memoize(() => {
    if (serverCache) {
      return currentData;
    }
    return state.sorting.reduce((data, sort) => {
      const column = columns.find(col => col.id === sort.id);
      if (!column) return data;
      return [...data].sort((a, b) => {
        const valueA = column.accessorFn ? column.accessorFn(a) : (column.accessorKey ? a[column.accessorKey] : undefined);
        const valueB = column.accessorFn ? column.accessorFn(b) : (column.accessorKey ? b[column.accessorKey] : undefined);
        return sort.desc ? (valueA < valueB ? 1 : -1) : (valueA > valueB ? 1 : -1);
      });
    }, currentData);
  });

  const getFilteredData = memoize(() => {
    if (serverCache) {
      return currentData;
    }

    let filteredData = [...currentData];

    // Apply global filter if present
    if (state.globalFilter?.value) {
      const searchValue = state.globalFilter.value.toLowerCase();
      const searchableColumns = columns.filter(col => 
        col.searchable !== false && 
        (state.globalFilter?.columns?.includes(col.id) ?? true)
      );

      filteredData = filteredData.filter(row => {
        return searchableColumns.some(column => {
          const value = column.accessorFn 
            ? column.accessorFn(row)
            : column.accessorKey 
            ? row[column.accessorKey]
            : undefined;
          
          return String(value).toLowerCase().includes(searchValue);
        });
      });
    }

    // Apply column filters
    return state.filters.reduce((data, filter) => {
      const column = columns.find(col => col.id === filter.id);
      if (!column || column.filterable === false) return data;

      return data.filter(row => {
        const value = column.accessorFn 
          ? column.accessorFn(row)
          : column.accessorKey 
          ? row[column.accessorKey]
          : undefined;

        if (column.filterFn) {
          return column.filterFn(value, filter.value, filter.operator);
        }

        // Default filter implementations
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'notEquals':
            return value !== filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'notContains':
            return !String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'greaterThanOrEqual':
            return Number(value) >= Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'lessThanOrEqual':
            return Number(value) <= Number(filter.value);
          case 'between': {
            const [min, max] = filter.value as [number, number];
            const numValue = Number(value);
            return numValue >= min && numValue <= max;
          }
          case 'in':
            return (filter.value as any[]).includes(value);
          case 'notIn':
            return !(filter.value as any[]).includes(value);
          case 'isNull':
            return value === null || value === undefined;
          case 'isNotNull':
            return value !== null && value !== undefined;
          default:
            return true;
        }
      });
    }, filteredData);
  });

  const getSelectedRows = memoize(() => {
    return currentData.filter(row => state.selection.includes(row.id));
  });

  const updateState = (action: Parameters<typeof tableReducer>[1]) => {
    batchUpdates(() => {
      state = tableReducer(state, action);
      saveTableState(options.tableId, state);
    });
  };

  const updateServerState = (updates: Partial<ServerState>) => {
    updateState({
      type: 'SET_SERVER_STATE',
      payload: {
        ...state.serverState,
        ...updates,
      },
    });
  };

  const fetchData = async () => {
    if (!serverCache) return;

    try {
      updateServerState({ isFetching: true, error: null });
      const result = await serverCache.getData(state);
      currentData = result.data;
      updateServerState({
        isFetching: false,
        totalCount: result.totalCount,
        pageCount: result.pageCount,
      });
    } catch (error) {
      updateServerState({
        isFetching: false,
        error: error as Error,
      });
    }
  };

  const setPageIndex = (pageIndex: number) => {
    updateState({
      type: 'SET_PAGINATION',
      payload: {
        ...state.pagination,
        pageIndex,
      },
    });
    if (serverCache) {
      fetchData();
    }
  };

  const setPageSize = (pageSize: number) => {
    updateState({
      type: 'SET_PAGINATION',
      payload: {
        ...state.pagination,
        pageSize,
        pageIndex: 0,
      },
    });
    if (serverCache) {
      fetchData();
    }
  };

  const invalidateQueries = () => {
    if (serverCache) {
      serverCache.invalidate();
      fetchData();
    }
  };

  const toggleRowSelection = (id: string) => {
    updateState({
      type: 'SET_SELECTION',
      payload: state.selection.includes(id)
        ? state.selection.filter(selectedId => selectedId !== id)
        : [...state.selection, id]
    });
  };

  const resizeColumn = (columnId: string, width: number) => {
    if (!isValidColumnId<TData>(columns, columnId)) return;
    const column = columns.find(col => col.id === columnId);
    if (!column || !canResizeColumn<TData>(column)) return;

    const clampedWidth = clampColumnWidth<TData>(column, width);
    updateState({
      type: 'SET_COLUMN_SIZE',
      payload: { columnId, width: clampedWidth },
    });
  };

  const reorderColumn = (sourceId: string, targetId: string) => {
    if (!isValidColumnId<TData>(columns, sourceId) || !isValidColumnId<TData>(columns, targetId)) return;
    
    const sourceColumn = columns.find(col => col.id === sourceId);
    const targetColumn = columns.find(col => col.id === targetId);
    if (!sourceColumn || !targetColumn || !canReorderColumn<TData>(sourceColumn) || !canReorderColumn<TData>(targetColumn)) return;

    const currentOrder = state.columnOrder.length ? state.columnOrder : columns.map(col => col.id);
    const sourceIndex = currentOrder.indexOf(sourceId);
    const targetIndex = currentOrder.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newOrder = moveColumn(currentOrder, sourceIndex, targetIndex);
    updateState({
      type: 'SET_COLUMN_ORDER',
      payload: newOrder,
    });
  };

  const getColumns = () => columns;

  const pinColumn = (columnId: string, position: 'left' | 'right' | false) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    columns = columns.map(col => 
      col.id === columnId 
        ? { ...col, pinned: position }
        : col
    );

    updateState({
      type: 'SET_PINNED_COLUMN',
      payload: { columnId, position }
    });
  };

  const getPinnedColumns = (position: 'left' | 'right') => {
    return columns.filter(col => col.pinned === position);
  };

  const getUnpinnedColumns = () => {
    return columns.filter(col => !col.pinned);
  };

  const toggleColumnVisibility = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    updateState({
      type: 'TOGGLE_COLUMN_VISIBILITY',
      payload: columnId
    });
  };

  const getVisibleColumns = () => {
    return columns.filter(column => {
      if (column.id in state.columnVisibility) {
        return state.columnVisibility[column.id];
      }
      return true;
    });
  };

  const getServerState = () => state.serverState;

  const getVirtualizer = () => virtualizer;

  const exportDataMethod = async (options: ExportOptions) => {
    const data = getFilteredData();
    await exportData(data, columns, options);
  };

  const setGlobalFilter = (value: string) => {
    updateState({
      type: 'SET_GLOBAL_FILTER',
      payload: {
        value,
        columns: columns
          .filter(col => col.searchable !== false)
          .map(col => col.id)
      }
    });
  };

  const setColumnFilter = (columnId: string, value: unknown, operator: FilterOperator) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || column.filterable === false) return;

    updateState({
      type: 'SET_COLUMN_FILTER',
      payload: {
        id: columnId,
        value,
        operator
      }
    });
  };

  const clearFilters = () => {
    updateState({
      type: 'CLEAR_FILTERS',
      payload: null
    });
  };

  const clearColumnFilter = (columnId: string) => {
    updateState({
      type: 'CLEAR_COLUMN_FILTER',
      payload: columnId
    });
  };

  const getFilteredColumns = () => {
    return columns.filter(col => col.filterable !== false);
  };

  const getSearchableColumns = () => {
    return columns.filter(col => col.searchable !== false);
  };

  const instance: TableInstance<TData> = {
    getColumns,
    getState: () => state,
    getSortedData,
    getFilteredData,
    getSelectedRows,
    toggleRowSelection,
    resizeColumn,
    reorderColumn,
    pinColumn,
    getPinnedColumns,
    getUnpinnedColumns,
    toggleColumnVisibility,
    getVisibleColumns,
    tableId: options.tableId,
    fetchData,
    setPageIndex,
    setPageSize,
    invalidateQueries,
    getServerState,
    getVirtualizer,
    exportData: exportDataMethod,
    setGlobalFilter,
    setColumnFilter,
    clearFilters,
    clearColumnFilter,
    getFilteredColumns,
    getSearchableColumns,
  };

  // Initial data fetch if using server-side operations
  if (serverCache) {
    fetchData();
  }

  return instance;
} 