import { forwardRef } from 'react';
import { useTableContext } from './context';
import type { TableBodyProps } from './types';
import type { VirtualItem } from '@butter-table/butter-virtual';
import type { ColumnDef } from '@butter-table/butter-core';

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, style, ...rest }, ref) => {
    const { instance, rowVirtualizer, columnVirtualizer } = useTableContext();
    const data = instance.getData();
    const columns = instance.getColumns();

    return (
      <tbody ref={ref} className={className} style={style} {...rest}>
        {rowVirtualizer
          ? rowVirtualizer.virtualItems.map((virtualRow: VirtualItem) => {
              const row = data[virtualRow.index];
              return (
                <tr
                  key={virtualRow.key}
                  role="row"
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {columnVirtualizer
                    ? columnVirtualizer.virtualItems.map((virtualColumn: VirtualItem) => {
                        const column = columns[virtualColumn.index] as ColumnDef<any>;
                        const value = column.accessorKey
                          ? row[column.accessorKey]
                          : undefined;
                        return (
                          <td
                            key={`${virtualRow.key}-${column.id}`}
                            role="gridcell"
                            style={{
                              width: virtualColumn.size,
                              transform: `translateX(${virtualColumn.start}px)`,
                            }}
                          >
                            {column.cell
                              ? column.cell({ value, row })
                              : String(value)}
                          </td>
                        );
                      })
                    : columns.map((column: ColumnDef<any>) => {
                        const value = column.accessorKey
                          ? row[column.accessorKey]
                          : undefined;
                        return (
                          <td key={column.id} role="gridcell">
                            {column.cell
                              ? column.cell({ value, row })
                              : String(value)}
                          </td>
                        );
                      })}
                </tr>
              );
            })
          : data.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} role="row">
                {columns.map((column: ColumnDef<any>) => {
                  const value = column.accessorKey
                    ? row[column.accessorKey]
                    : undefined;
                  return (
                    <td key={column.id} role="gridcell">
                      {column.cell
                        ? column.cell({ value, row })
                        : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
      </tbody>
    );
  }
); 