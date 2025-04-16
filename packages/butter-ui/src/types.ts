import type { TableInstance } from '@butter-table/butter-core';
import type { VirtualInstance } from '@butter-table/butter-virtual';

export interface TableProps<TData extends object> {
  /**
   * The table instance from butter-core
   */
  instance: TableInstance<TData>;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Additional styles
   */
  style?: React.CSSProperties;
  /**
   * Whether to enable row virtualization
   * @default true
   */
  enableRowVirtualization?: boolean;
  /**
   * Whether to enable column virtualization
   * @default true
   */
  enableColumnVirtualization?: boolean;
  /**
   * The estimated height of each row in pixels
   * @default 50
   */
  rowHeight?: number;
  /**
   * The estimated width of each column in pixels
   * @default 150
   */
  columnWidth?: number;
  /**
   * The number of items to render outside of the visible area
   * @default 5
   */
  overscan?: number;
}

export interface TableContextValue<TData extends object> {
  instance: TableInstance<TData>;
  rowVirtualizer?: VirtualInstance;
  columnVirtualizer?: VirtualInstance;
}

export interface TableHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface TableBodyProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface TableRowProps {
  className?: string;
  style?: React.CSSProperties;
  index: number;
}

export interface TableCellProps {
  className?: string;
  style?: React.CSSProperties;
  columnIndex: number;
  rowIndex: number;
} 