import type { AnyData, ColumnDef, FilterState } from './types';

/**
 * Creates a default column definition with common properties
 */
export function createColumn<TData extends AnyData>(
  id: string,
  options: Partial<ColumnDef<TData>> = {}
): ColumnDef<TData> {
  return {
    id,
    header: id.charAt(0).toUpperCase() + id.slice(1),
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    ...options,
  };
}

/**
 * Creates a filter state object
 */
export function createFilter(
  columnId: string,
  value: unknown,
  operator: FilterState['operator'] = 'equals'
): FilterState {
  return {
    id: columnId,
    value,
    operator,
  };
}

/**
 * Creates a sorting state object
 */
export function createSort(id: string, desc = false) {
  return { id, desc };
}

/**
 * Calculates the total width of all columns
 */
export function getTotalWidth<TData extends AnyData>(columns: ColumnDef<TData>[]): number {
  return columns.reduce((total, column) => total + (column.width ?? 0), 0);
}

/**
 * Distributes remaining width evenly among columns
 */
export function distributeWidth<TData extends AnyData>(
  columns: ColumnDef<TData>[],
  totalWidth: number
): ColumnDef<TData>[] {
  const columnsWithWidth = columns.filter(col => col.width);
  const remainingWidth = totalWidth - getTotalWidth(columnsWithWidth);
  const columnsWithoutWidth = columns.filter(col => !col.width);
  const widthPerColumn = remainingWidth / columnsWithoutWidth.length;

  return columns.map(col => ({
    ...col,
    width: col.width ?? widthPerColumn,
  }));
}

/**
 * Validates if a column ID exists in the columns array
 */
export function isValidColumnId<TData extends AnyData>(columns: ColumnDef<TData>[], id: string): boolean {
  return columns.some(col => col.id === id);
}

/**
 * Gets the minimum width for a column based on its content
 */
export function getMinColumnWidth<TData extends AnyData>(column: ColumnDef<TData>): number {
  // Base minimum width for any column
  let minWidth = 50;

  // Add extra width for sortable/filterable columns to accommodate controls
  if (column.sortable) minWidth += 20;
  if (column.filterable) minWidth += 20;

  return minWidth;
}

/**
 * Ensures a column width stays within valid bounds
 */
export function clampColumnWidth<TData extends AnyData>(
  column: ColumnDef<TData>,
  width: number
): number {
  const minWidth = getMinColumnWidth(column);
  return Math.max(minWidth, width);
}

/**
 * Creates a new column order by moving a column from one position to another
 */
export function moveColumn(
  columnOrder: string[],
  sourceIndex: number,
  targetIndex: number
): string[] {
  const newOrder = [...columnOrder];
  const [removed] = newOrder.splice(sourceIndex, 1);
  newOrder.splice(targetIndex, 0, removed);
  return newOrder;
}

/**
 * Checks if a column can be resized
 */
export function canResizeColumn<TData extends AnyData>(column: ColumnDef<TData>): boolean {
  return column.resizable ?? true;
}

/**
 * Checks if a column can be reordered
 */
export function canReorderColumn<TData extends AnyData>(column: ColumnDef<TData>): boolean {
  return column.reorderable ?? true;
}

/**
 * Gets the next sort direction for a column
 */
export function getNextSortDirection(
  currentSort: { id: string; desc: boolean }[],
  columnId: string
): boolean | undefined {
  const existingSort = currentSort.find(sort => sort.id === columnId);
  if (!existingSort) return false;
  if (!existingSort.desc) return true;
  return undefined; // Will remove the sort
}

/**
 * Creates a new sort state by toggling a column's sort direction
 */
export function toggleSort(
  currentSort: { id: string; desc: boolean }[],
  columnId: string
): { id: string; desc: boolean }[] {
  const nextDirection = getNextSortDirection(currentSort, columnId);
  if (nextDirection === undefined) {
    return currentSort.filter(sort => sort.id !== columnId);
  }
  return [
    ...currentSort.filter(sort => sort.id !== columnId),
    { id: columnId, desc: nextDirection },
  ];
} 