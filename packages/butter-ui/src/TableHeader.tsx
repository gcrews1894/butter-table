import { forwardRef } from 'react';
import { useTableContext } from './context';
import type { TableHeaderProps } from './types';
import type { VirtualItem } from '@butter-table/butter-virtual';
import type { ColumnDef } from '@butter-table/butter-core';

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, style, ...rest }, ref) => {
    const { instance, columnVirtualizer } = useTableContext();
    const columns = instance.getColumns();

    return (
      <thead ref={ref} className={className} style={style} {...rest}>
        <tr role="row">
          {columnVirtualizer
            ? columnVirtualizer.virtualItems.map((virtualColumn: VirtualItem) => {
                const column = columns[virtualColumn.index] as ColumnDef<any>;
                return (
                  <th
                    key={column.id}
                    role="columnheader"
                    style={{
                      width: virtualColumn.size,
                      transform: `translateX(${virtualColumn.start}px)`,
                    }}
                  >
                    {column.header}
                  </th>
                );
              })
            : columns.map((column: ColumnDef<any>) => (
                <th key={column.id} role="columnheader">
                  {column.header}
                </th>
              ))}
        </tr>
      </thead>
    );
  }
); 