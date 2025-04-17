import type { Virtualizer } from '@tanstack/virtual-core';

export interface VirtualOptions {
  /**
   * The number of items to render outside of the visible area
   * @default 5
   */
  overscan?: number;
  /**
   * The estimated size of each item in pixels
   * @default 50
   */
  estimateSize?: number | ((index: number) => number);
  /**
   * The size of the scrollable container
   */
  containerSize?: number;
  /**
   * The total number of items to virtualize
   */
  count: number;
  /**
   * The current scroll offset
   */
  scrollOffset?: number;
  /**
   * Whether to use dynamic sizing
   * @default false
   */
  dynamic?: boolean;
  horizontal?: boolean;
  onScroll?: (offset: number) => void;
  onMeasure?: (sizes: number[]) => void;
}

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
  key: string;
  measureRef?: (element: HTMLElement | null) => void;
}

export interface VirtualInstance {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  measure: () => void;
  getVirtualizer: () => Virtualizer<HTMLElement, HTMLElement> | null;
}

export interface TableVirtualOptions extends VirtualOptions {
  rowCount: number;
  columnCount: number;
  rowHeight?: number | ((index: number) => number);
  columnWidth?: number | ((index: number) => number);
  enableColumnVirtualization?: boolean;
  enableRowVirtualization?: boolean;
}

export interface TableVirtualInstance extends VirtualInstance {
  columnVirtualItems: VirtualItem[];
  rowVirtualItems: VirtualItem[];
  totalColumnSize: number;
  totalRowSize: number;
  scrollToCell: (rowIndex: number, columnIndex: number) => void;
} 