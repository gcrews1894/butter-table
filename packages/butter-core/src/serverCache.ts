import type { ServerOptions, TableState } from './types';

interface CacheEntry<TData> {
  data: TData[];
  totalCount: number;
  pageCount: number;
  timestamp: number;
}

interface Cache<TData> {
  [key: string]: CacheEntry<TData>;
}

export class ServerCache<TData> {
  private cache: Cache<TData> = {};
  private options: ServerOptions<TData>;

  constructor(options: ServerOptions<TData>) {
    this.options = options;
  }

  private generateCacheKey(state: TableState): string {
    return JSON.stringify({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      sorting: state.sorting,
      filters: state.filters,
    });
  }

  async getData(state: TableState): Promise<{
    data: TData[];
    totalCount: number;
    pageCount: number;
  }> {
    const cacheKey = this.generateCacheKey(state);
    const cachedEntry = this.cache[cacheKey];

    if (cachedEntry) {
      const isStale = Date.now() - cachedEntry.timestamp > (this.options.staleTime ?? 0);
      if (!isStale) {
        return {
          data: cachedEntry.data,
          totalCount: cachedEntry.totalCount,
          pageCount: cachedEntry.pageCount,
        };
      }
    }

    const result = await this.options.fetchData({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      sorting: state.sorting,
      filters: state.filters,
    });

    this.cache[cacheKey] = {
      data: result.data,
      totalCount: result.totalCount,
      pageCount: result.pageCount,
      timestamp: Date.now(),
    };

    // Clean up old cache entries
    this.cleanupCache();

    return result;
  }

  private cleanupCache() {
    const now = Date.now();
    const cacheTime = this.options.cacheTime ?? 5 * 60 * 1000; // Default 5 minutes

    Object.keys(this.cache).forEach(key => {
      if (now - this.cache[key].timestamp > cacheTime) {
        delete this.cache[key];
      }
    });
  }

  invalidate() {
    this.cache = {};
  }

  invalidateMatching(state: Partial<TableState>) {
    Object.keys(this.cache).forEach(key => {
      const cachedState = JSON.parse(key);
      if (Object.entries(state).every(([k, v]) => cachedState[k] === v)) {
        delete this.cache[key];
      }
    });
  }
} 