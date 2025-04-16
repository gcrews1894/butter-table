import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useVirtual } from '@butter-table/butter-virtual';
import type { TableInstance } from '@butter-table/butter-core';
import type { VirtualInstance } from '@butter-table/butter-virtual';
import type { TableProps } from './types';
import { TableProvider } from './context';

export const Table = forwardRef<HTMLTableElement, TableProps<any>>(
  (
    {
      instance,
      className,
      style,
      enableRowVirtualization = true,
      enableColumnVirtualization = true,
      rowHeight = 50,
      columnWidth = 150,
      overscan = 5,
      ...rest
    },
    ref
  ) => {
    const tableRef = useRef<HTMLTableElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const updateContainerSize = useCallback(() => {
      if (tableRef.current) {
        const { clientWidth, clientHeight } = tableRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    }, []);

    useEffect(() => {
      updateContainerSize();
      window.addEventListener('resize', updateContainerSize);
      return () => window.removeEventListener('resize', updateContainerSize);
    }, [updateContainerSize]);

    const rowVirtualizer = enableRowVirtualization
      ? useVirtual({
          count: instance.getData().length,
          containerSize: containerSize.height,
          scrollOffset: 0,
          estimateSize: rowHeight,
          overscan,
        })
      : undefined;

    const columnVirtualizer = enableColumnVirtualization
      ? useVirtual({
          count: instance.getColumns().length,
          containerSize: containerSize.width,
          scrollOffset: 0,
          estimateSize: columnWidth,
          overscan,
        })
      : undefined;

    const handleRef = useCallback(
      (node: HTMLTableElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTableElement | null>).current = node;
        }
        tableRef.current = node;
      },
      [ref]
    );

    return (
      <TableProvider
        value={{
          instance,
          rowVirtualizer,
          columnVirtualizer,
        }}
      >
        <table
          ref={handleRef}
          className={className}
          style={style}
          role="grid"
          aria-rowcount={instance.getData().length}
          aria-colcount={instance.getColumns().length}
          {...rest}
        >
          {/* Table content will be added in separate components */}
        </table>
      </TableProvider>
    );
  }
); 