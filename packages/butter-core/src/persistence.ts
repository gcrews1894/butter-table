import type { TableState } from './types';

const STORAGE_KEY_PREFIX = 'butter-table-state-';

export function saveTableState(tableId: string, state: TableState): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save table state:', error);
  }
}

export function loadTableState(tableId: string): Partial<TableState> | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    const savedState = localStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.warn('Failed to load table state:', error);
    return null;
  }
}

export function clearTableState(tableId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear table state:', error);
  }
} 