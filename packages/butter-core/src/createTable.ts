import type { AnyData, ColumnDef, TableInstance, TableOptions, TableState } from './types';

export function createTable<TData extends AnyData>(
  options: TableOptions<TData>
): TableInstance<TData> {
  const initialState: TableState = {
    sorting: options.initialState?.sorting ?? [],
    pagination: options.initialState?.pagination ?? { pageIndex: 0, pageSize: 10 },
  };

  let state = initialState;

  const instance: TableInstance<TData> = {
    getColumns: () => options.columns,
    getData: () => options.data,
    getState: () => state,
    setState: (updater) => {
      state = updater(state);
    },
  };

  return instance;
} 