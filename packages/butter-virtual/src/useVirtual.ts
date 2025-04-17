import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Virtualizer, observeElementRect, observeElementOffset, elementScroll } from '@tanstack/virtual-core';
import type { VirtualInstance, VirtualOptions, VirtualItem } from './types';

export function useVirtual(options: VirtualOptions): VirtualInstance {
  const {
    overscan = 5,
    estimateSize = 50,
    containerSize,
    count,
    scrollOffset,
    dynamic = false,
    horizontal = false,
    onScroll,
    onMeasure,
  } = options;

  const [virtualizer, setVirtualizer] = useState<Virtualizer<HTMLElement, HTMLElement> | null>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const sizeCache = useRef<Map<number, number>>(new Map());

  const getSize = useCallback(
    (index: number) => {
      if (dynamic && sizeCache.current.has(index)) {
        return sizeCache.current.get(index) ?? estimateSize;
      }
      return estimateSize;
    },
    [dynamic, estimateSize]
  );

  useEffect(() => {
    if (!parentRef.current) return;

    const element = parentRef.current;
    const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
      count,
      getScrollElement: () => element,
      estimateSize: getSize,
      overscan,
      scrollMargin: scrollOffset,
      scrollToFn: elementScroll,
      observeElementRect,
      observeElementOffset,
      horizontal,
    });

    setVirtualizer(virtualizer);
    virtualizer.measure();

    const handleScroll = () => {
      const offset = virtualizer?.scrollOffset;
      if (offset !== undefined) {
        onScroll?.(offset);
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      virtualizer.options.count = 0;
      virtualizer.measure();
    };
  }, [count, estimateSize, overscan, scrollOffset, dynamic, horizontal, getSize, onScroll]);

  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      virtualizer?.scrollToIndex(index, options);
    },
    [virtualizer]
  );

  const scrollToOffset = useCallback(
    (offset: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      virtualizer?.scrollToOffset(offset, options);
    },
    [virtualizer]
  );

  const measure = useCallback(() => {
    if (!virtualizer) return;
    
    virtualizer.measure();
    
    if (dynamic) {
      const newSizes = virtualizer.getVirtualItems().map(item => item.size);
      onMeasure?.(newSizes);
      newSizes.forEach((size, index) => {
        sizeCache.current.set(index, size);
      });
    }
  }, [virtualizer, dynamic, onMeasure]);

  const virtualItems = useMemo(() => {
    if (!virtualizer) return [];
    
    return virtualizer.getVirtualItems().map(item => ({
      ...item,
      key: item.key.toString(),
      measureRef: dynamic ? (element: HTMLElement | null) => {
        if (element) {
          const size = horizontal ? element.offsetWidth : element.offsetHeight;
          sizeCache.current.set(item.index, size);
          measure();
        }
      } : undefined,
    }));
  }, [virtualizer, dynamic, horizontal, measure]);

  return {
    virtualItems,
    totalSize: virtualizer?.getTotalSize() ?? 0,
    scrollToIndex,
    scrollToOffset,
    measure,
    getVirtualizer: () => virtualizer,
  };
} 