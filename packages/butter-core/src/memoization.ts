type MemoizedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  clear: () => void;
};

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    equalityFn?: (a: Parameters<T>, b: Parameters<T>) => boolean;
  } = {}
): MemoizedFunction<T> {
  const cache = new Map<string, ReturnType<T>>();
  const { maxSize = 100, equalityFn = (a, b) => JSON.stringify(a) === JSON.stringify(b) } = options;

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args) || '[]';
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Remove oldest entry if cache exceeds max size
    if (cache.size > maxSize) {
      const firstKey = Array.from(cache.keys())[0];
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    return result;
  };

  memoized.clear = () => {
    cache.clear();
  };

  return memoized;
}

export function memoizeSelector<TState, TResult>(
  selector: (state: TState) => TResult,
  options: {
    maxSize?: number;
    equalityFn?: (a: TState, b: TState) => boolean;
  } = {}
): (state: TState) => TResult {
  const { maxSize = 100, equalityFn = (a, b) => JSON.stringify(a) === JSON.stringify(b) } = options;
  let lastState: TState | null = null;
  let lastResult: TResult | null = null;

  return (state: TState): TResult => {
    if (lastState && equalityFn(lastState, state)) {
      return lastResult!;
    }

    lastState = state;
    lastResult = selector(state);
    return lastResult;
  };
} 