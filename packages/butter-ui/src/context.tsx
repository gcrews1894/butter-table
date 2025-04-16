import { createContext, useContext } from 'react';
import type { TableContextValue } from './types';

const TableContext = createContext<TableContextValue<any> | null>(null);

export function useTableContext<TData extends object>() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a Table component');
  }
  return context as TableContextValue<TData>;
}

export function TableProvider<TData extends object>({
  value,
  children,
}: {
  value: TableContextValue<TData>;
  children: React.ReactNode;
}) {
  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
} 