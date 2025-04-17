import { describe, it, expect } from 'vitest';
import { createTable } from './createTable';
import type { AnyData, ColumnDef } from './types';

interface TestData extends AnyData {
  id: string;
  name: string;
  age: number;
}

interface TestDataWithNull extends AnyData {
  id: string;
  name: string;
  age: number | null;
}

interface TestDataWithUndefined extends AnyData {
  id: string;
  name: string;
  age: number | undefined;
}

interface TestDataWithMixedTypes extends AnyData {
  id: string;
  name: string;
  age: number | string;
}

describe('createTable', () => {
  const testData: TestData[] = [
    { id: '1', name: 'Alice', age: 25 },
    { id: '2', name: 'Bob', age: 30 },
    { id: '3', name: 'Charlie', age: 35 },
  ];

  const columns: ColumnDef<TestData>[] = [
    { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
    { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
  ];

  it('should create a table instance with initial state', () => {
    const table = createTable({
      data: testData,
      columns,
    });

    expect(table.getData()).toEqual(testData);
    expect(table.getColumns()).toEqual(columns);
    expect(table.getState()).toEqual({
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      filters: [],
      selection: [],
    });
  });

  it('should handle empty data array', () => {
    const table = createTable({
      data: [],
      columns,
    });

    expect(table.getData()).toEqual([]);
    expect(table.getSortedData()).toEqual([]);
    expect(table.getFilteredData()).toEqual([]);
    expect(table.getSelectedRows()).toEqual([]);
  });

  it('should handle empty columns array', () => {
    const table = createTable({
      data: testData,
      columns: [],
    });

    expect(table.getColumns()).toEqual([]);
    expect(table.getSortedData()).toEqual(testData); // No sorting without columns
  });

  it('should handle undefined data', () => {
    const table = createTable({
      data: undefined as any,
      columns,
    });

    expect(table.getData()).toEqual([]);
    expect(table.getSortedData()).toEqual([]);
  });

  it('should handle null data', () => {
    const table = createTable({
      data: null as any,
      columns,
    });

    expect(table.getData()).toEqual([]);
    expect(table.getSortedData()).toEqual([]);
  });

  it('should handle missing accessorKey in columns', () => {
    const table = createTable({
      data: testData,
      columns: [{ id: 'name', header: 'Name' }],
    });

    expect(table.getSortedData()).toEqual(testData); // No sorting without accessorKey
  });

  it('should handle invalid sort column', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        sorting: [{ id: 'invalid', desc: true }],
      },
    });

    expect(table.getSortedData()).toEqual(testData); // No sorting with invalid column
  });

  it('should handle invalid filter column', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        filters: [{ id: 'invalid', value: 'test', operator: 'equals' }],
      },
    });

    expect(table.getFilteredData()).toEqual(testData); // No filtering with invalid column
  });

  it('should handle invalid filter operator', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        filters: [{ id: 'name', value: 'test', operator: 'invalid' as any }],
      },
    });

    expect(table.getFilteredData()).toEqual(testData); // No filtering with invalid operator
  });

  it('should handle non-existent row selection', () => {
    const table = createTable({
      data: testData,
      columns,
    });

    table.toggleRowSelection('999');
    expect(table.getSelectedRows()).toEqual([]);
  });

  it('should handle sorting with null values', () => {
    const dataWithNulls: TestDataWithNull[] = [
      { id: '1', name: 'Alice', age: null },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithNull: ColumnDef<TestDataWithNull>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: dataWithNulls,
      columns: columnsWithNull,
      initialState: {
        sorting: [{ id: 'age', desc: true }],
      },
    });

    const sortedData = table.getSortedData();
    expect(sortedData[0].age).toBe(35);
    expect(sortedData[1].age).toBe(30);
    expect(sortedData[2].age).toBeNull();
  });

  it('should handle filtering with null values', () => {
    const dataWithNulls: TestDataWithNull[] = [
      { id: '1', name: 'Alice', age: null },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithNull: ColumnDef<TestDataWithNull>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: dataWithNulls,
      columns: columnsWithNull,
      initialState: {
        filters: [{ id: 'age', value: null, operator: 'equals' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([{ id: '1', name: 'Alice', age: null }]);
  });

  it('should handle sorting with undefined values', () => {
    const dataWithUndefined: TestDataWithUndefined[] = [
      { id: '1', name: 'Alice', age: undefined },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithUndefined: ColumnDef<TestDataWithUndefined>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: dataWithUndefined,
      columns: columnsWithUndefined,
      initialState: {
        sorting: [{ id: 'age', desc: true }],
      },
    });

    const sortedData = table.getSortedData();
    expect(sortedData[0].age).toBe(35);
    expect(sortedData[1].age).toBe(30);
    expect(sortedData[2].age).toBeUndefined();
  });

  it('should handle filtering with undefined values', () => {
    const dataWithUndefined: TestDataWithUndefined[] = [
      { id: '1', name: 'Alice', age: undefined },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithUndefined: ColumnDef<TestDataWithUndefined>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: dataWithUndefined,
      columns: columnsWithUndefined,
      initialState: {
        filters: [{ id: 'age', value: undefined, operator: 'equals' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([{ id: '1', name: 'Alice', age: undefined }]);
  });

  it('should handle sorting with mixed types', () => {
    const mixedData: TestDataWithMixedTypes[] = [
      { id: '1', name: 'Alice', age: '25' },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithMixedTypes: ColumnDef<TestDataWithMixedTypes>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: mixedData,
      columns: columnsWithMixedTypes,
      initialState: {
        sorting: [{ id: 'age', desc: true }],
      },
    });

    const sortedData = table.getSortedData();
    expect(sortedData[0].age).toBe(35);
    expect(sortedData[1].age).toBe(30);
    expect(sortedData[2].age).toBe('25');
  });

  it('should handle filtering with mixed types', () => {
    const mixedData: TestDataWithMixedTypes[] = [
      { id: '1', name: 'Alice', age: '25' },
      { id: '2', name: 'Bob', age: 30 },
      { id: '3', name: 'Charlie', age: 35 },
    ];

    const columnsWithMixedTypes: ColumnDef<TestDataWithMixedTypes>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
      { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
    ];

    const table = createTable({
      data: mixedData,
      columns: columnsWithMixedTypes,
      initialState: {
        filters: [{ id: 'age', value: 30, operator: 'equals' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([{ id: '2', name: 'Bob', age: 30 }]);
  });

  it('should sort data correctly', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        sorting: [{ id: 'age', desc: true }],
      },
    });

    const sortedData = table.getSortedData();
    expect(sortedData).toEqual([
      { id: '3', name: 'Charlie', age: 35 },
      { id: '2', name: 'Bob', age: 30 },
      { id: '1', name: 'Alice', age: 25 },
    ]);
  });

  it('should filter data correctly', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        filters: [{ id: 'name', value: 'Alice', operator: 'equals' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([{ id: '1', name: 'Alice', age: 25 }]);
  });

  it('should handle row selection', () => {
    const table = createTable({
      data: testData,
      columns,
    });

    table.toggleRowSelection('1');
    expect(table.getSelectedRows()).toEqual([{ id: '1', name: 'Alice', age: 25 }]);

    table.toggleRowSelection('1');
    expect(table.getSelectedRows()).toEqual([]);
  });

  it('should combine sorting and filtering', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        sorting: [{ id: 'age', desc: true }],
        filters: [{ id: 'age', value: 30, operator: 'greaterThan' }],
      },
    });

    const filteredAndSortedData = table.getFilteredData();
    expect(filteredAndSortedData).toEqual([
      { id: '3', name: 'Charlie', age: 35 },
      { id: '2', name: 'Bob', age: 30 },
    ]);
  });

  it('should handle string comparison operators', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        filters: [{ id: 'name', value: 'li', operator: 'contains' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([
      { id: '1', name: 'Alice', age: 25 },
      { id: '3', name: 'Charlie', age: 35 },
    ]);
  });

  it('should handle numeric comparison operators', () => {
    const table = createTable({
      data: testData,
      columns,
      initialState: {
        filters: [{ id: 'age', value: 30, operator: 'lessThan' }],
      },
    });

    const filteredData = table.getFilteredData();
    expect(filteredData).toEqual([{ id: '1', name: 'Alice', age: 25 }]);
  });
}); 