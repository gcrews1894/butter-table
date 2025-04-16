import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtualizer, observeElementRect, observeElementOffset, elementScroll } from '@tanstack/virtual-core';
import type { VirtualInstance, VirtualOptions } from './types';

export function useVirtual(options: VirtualOptions): VirtualInstance {
  const {
    overscan = 5,
    estimateSize = 50,
    containerSize,
    count,
    scrollOffset,
    dynamic = false,
  } = options;

  const [virtualizer, setVirtualizer] = useState<Virtualizer<HTMLElement, HTMLElement> | null>(null);
  const parentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!parentRef.current) return;

    const element = parentRef.current;
    const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
      count,
      getScrollElement: () => element,
      estimateSize: () => estimateSize,
      overscan,
      scrollMargin: scrollOffset,
      scrollToFn: elementScroll,
      observeElementRect,
      observeElementOffset,
    });

    setVirtualizer(virtualizer);
    virtualizer.measure();

    return () => {
      virtualizer.options.count = 0;
      virtualizer.measure();
    };
  }, [count, estimateSize, overscan, scrollOffset, dynamic]);

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
    virtualizer?.measure();
  }, [virtualizer]);

  return {
    virtualItems: virtualizer?.getVirtualItems().map(item => ({
      ...item,
      key: item.key.toString(),
    })) ?? [],
    totalSize: virtualizer?.getTotalSize() ?? 0,
    scrollToIndex,
    scrollToOffset,
    measure,
  };
} 