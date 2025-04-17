import { useCallback } from 'react';
import { useVirtual } from './useVirtual';
import type { TableVirtualOptions, TableVirtualInstance } from './types';

export function useTableVirtual(options: TableVirtualOptions): TableVirtualInstance {
  const {
    rowCount,
    columnCount,
    rowHeight = 50,
    columnWidth = 150,
    enableRowVirtualization = true,
    enableColumnVirtualization = true,
    ...rest
  } = options;

  const rowVirtualizer = useVirtual({
    ...rest,
    count: rowCount,
    estimateSize: typeof rowHeight === 'function' ? rowHeight : () => rowHeight,
    horizontal: false,
  });

  const columnVirtualizer = useVirtual({
    ...rest,
    count: columnCount,
    estimateSize: typeof columnWidth === 'function' ? columnWidth : () => columnWidth,
    horizontal: true,
  });

  const scrollToCell = useCallback(
    (rowIndex: number, columnIndex: number) => {
      if (enableRowVirtualization) {
        rowVirtualizer.scrollToIndex(rowIndex, { align: 'center' });
      }
      if (enableColumnVirtualization) {
        columnVirtualizer.scrollToIndex(columnIndex, { align: 'center' });
      }
    },
    [enableRowVirtualization, enableColumnVirtualization, rowVirtualizer, columnVirtualizer]
  );

  return {
    virtualItems: rowVirtualizer.virtualItems,
    totalSize: rowVirtualizer.totalSize,
    rowVirtualItems: enableRowVirtualization ? rowVirtualizer.virtualItems : [],
    columnVirtualItems: enableColumnVirtualization ? columnVirtualizer.virtualItems : [],
    totalRowSize: rowVirtualizer.totalSize,
    totalColumnSize: columnVirtualizer.totalSize,
    scrollToIndex: rowVirtualizer.scrollToIndex,
    scrollToOffset: rowVirtualizer.scrollToOffset,
    measure: () => {
      rowVirtualizer.measure();
      columnVirtualizer.measure();
    },
    scrollToCell,
    getVirtualizer: () => rowVirtualizer.getVirtualizer(),
  };
} 