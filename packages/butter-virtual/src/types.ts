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
  estimateSize?: number;
  /**
   * The size of the scrollable container
   */
  containerSize: number;
  /**
   * The total number of items to virtualize
   */
  count: number;
  /**
   * The current scroll offset
   */
  scrollOffset: number;
  /**
   * Whether to use dynamic sizing
   * @default false
   */
  dynamic?: boolean;
}

export interface VirtualInstance {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  measure: () => void;
}

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
  key: string;
} 