import { describe, it, expect } from 'vitest';
import {
  createColumn,
  createFilter,
  createSort,
  getTotalWidth,
  distributeWidth,
  isValidColumnId,
  getMinColumnWidth,
  clampColumnWidth,
  moveColumn,
  canResizeColumn,
  canReorderColumn,
  getNextSortDirection,
  toggleSort,
} from './utils';
import type { AnyData } from './types';

interface TestData extends AnyData {
  id: string;
  name: string;
  age: number;
}

describe('utils', () => {
  describe('createColumn', () => {
    it('should create a column with default properties', () => {
      const column = createColumn<TestData>('name');
      expect(column).toEqual({
        id: 'name',
        header: 'Name',
        sortable: true,
        filterable: true,
        resizable: true,
        reorderable: true,
      });
    });

    it('should override default properties', () => {
      const column = createColumn<TestData>('name', {
        header: 'Full Name',
        sortable: false,
        width: 200,
      });
      expect(column).toEqual({
        id: 'name',
        header: 'Full Name',
        sortable: false,
        filterable: true,
        resizable: true,
        reorderable: true,
        width: 200,
      });
    });
  });

  describe('createFilter', () => {
    it('should create a filter with default operator', () => {
      const filter = createFilter('name', 'John');
      expect(filter).toEqual({
        id: 'name',
        value: 'John',
        operator: 'equals',
      });
    });

    it('should create a filter with custom operator', () => {
      const filter = createFilter('age', 30, 'greaterThan');
      expect(filter).toEqual({
        id: 'age',
        value: 30,
        operator: 'greaterThan',
      });
    });
  });

  describe('createSort', () => {
    it('should create a sort with default direction', () => {
      const sort = createSort('name');
      expect(sort).toEqual({
        id: 'name',
        desc: false,
      });
    });

    it('should create a sort with custom direction', () => {
      const sort = createSort('name', true);
      expect(sort).toEqual({
        id: 'name',
        desc: true,
      });
    });
  });

  describe('getTotalWidth', () => {
    it('should calculate total width of columns', () => {
      const columns = [
        { id: 'name', width: 100 },
        { id: 'age', width: 150 },
        { id: 'email' },
      ];
      expect(getTotalWidth(columns)).toBe(250);
    });

    it('should handle empty columns array', () => {
      expect(getTotalWidth([])).toBe(0);
    });
  });

  describe('distributeWidth', () => {
    it('should distribute remaining width evenly', () => {
      const columns = [
        { id: 'name', width: 100 },
        { id: 'age' },
        { id: 'email' },
      ];
      const result = distributeWidth(columns, 300);
      expect(result[0].width).toBe(100);
      expect(result[1].width).toBe(100);
      expect(result[2].width).toBe(100);
    });

    it('should handle all columns having width', () => {
      const columns = [
        { id: 'name', width: 100 },
        { id: 'age', width: 150 },
      ];
      const result = distributeWidth(columns, 300);
      expect(result[0].width).toBe(100);
      expect(result[1].width).toBe(150);
    });
  });

  describe('isValidColumnId', () => {
    it('should return true for valid column ID', () => {
      const columns = [
        { id: 'name' },
        { id: 'age' },
      ];
      expect(isValidColumnId(columns, 'name')).toBe(true);
    });

    it('should return false for invalid column ID', () => {
      const columns = [
        { id: 'name' },
        { id: 'age' },
      ];
      expect(isValidColumnId(columns, 'invalid')).toBe(false);
    });
  });

  describe('getMinColumnWidth', () => {
    it('should calculate minimum width for basic column', () => {
      const column = { id: 'name' };
      expect(getMinColumnWidth(column)).toBe(50);
    });

    it('should add width for sortable column', () => {
      const column = { id: 'name', sortable: true };
      expect(getMinColumnWidth(column)).toBe(70);
    });

    it('should add width for filterable column', () => {
      const column = { id: 'name', filterable: true };
      expect(getMinColumnWidth(column)).toBe(70);
    });

    it('should add width for both sortable and filterable column', () => {
      const column = { id: 'name', sortable: true, filterable: true };
      expect(getMinColumnWidth(column)).toBe(90);
    });
  });

  describe('clampColumnWidth', () => {
    it('should return minimum width if input is less than minimum', () => {
      const column = { id: 'name' };
      expect(clampColumnWidth(column, 30)).toBe(50);
    });

    it('should return input width if greater than minimum', () => {
      const column = { id: 'name' };
      expect(clampColumnWidth(column, 100)).toBe(100);
    });
  });

  describe('moveColumn', () => {
    it('should move column to new position', () => {
      const order = ['name', 'age', 'email'];
      expect(moveColumn(order, 0, 2)).toEqual(['age', 'email', 'name']);
    });

    it('should handle moving to same position', () => {
      const order = ['name', 'age', 'email'];
      expect(moveColumn(order, 0, 0)).toEqual(['name', 'age', 'email']);
    });
  });

  describe('canResizeColumn', () => {
    it('should return true by default', () => {
      const column = { id: 'name' };
      expect(canResizeColumn(column)).toBe(true);
    });

    it('should respect resizable property', () => {
      const column = { id: 'name', resizable: false };
      expect(canResizeColumn(column)).toBe(false);
    });
  });

  describe('canReorderColumn', () => {
    it('should return true by default', () => {
      const column = { id: 'name' };
      expect(canReorderColumn(column)).toBe(true);
    });

    it('should respect reorderable property', () => {
      const column = { id: 'name', reorderable: false };
      expect(canReorderColumn(column)).toBe(false);
    });
  });

  describe('getNextSortDirection', () => {
    it('should return false for unsorted column', () => {
      const sort: { id: string; desc: boolean }[] = [];
      expect(getNextSortDirection(sort, 'name')).toBe(false);
    });

    it('should return true for ascending sort', () => {
      const sort: { id: string; desc: boolean }[] = [{ id: 'name', desc: false }];
      expect(getNextSortDirection(sort, 'name')).toBe(true);
    });

    it('should return undefined for descending sort', () => {
      const sort: { id: string; desc: boolean }[] = [{ id: 'name', desc: true }];
      expect(getNextSortDirection(sort, 'name')).toBeUndefined();
    });
  });

  describe('toggleSort', () => {
    it('should add sort for unsorted column', () => {
      const sort: { id: string; desc: boolean }[] = [];
      expect(toggleSort(sort, 'name')).toEqual([{ id: 'name', desc: false }]);
    });

    it('should change direction for ascending sort', () => {
      const sort: { id: string; desc: boolean }[] = [{ id: 'name', desc: false }];
      expect(toggleSort(sort, 'name')).toEqual([{ id: 'name', desc: true }]);
    });

    it('should remove sort for descending sort', () => {
      const sort: { id: string; desc: boolean }[] = [{ id: 'name', desc: true }];
      expect(toggleSort(sort, 'name')).toEqual([]);
    });

    it('should maintain other sorts', () => {
      const sort: { id: string; desc: boolean }[] = [
        { id: 'name', desc: false },
        { id: 'age', desc: true },
      ];
      expect(toggleSort(sort, 'name')).toEqual([{ id: 'age', desc: true }]);
    });
  });
}); 