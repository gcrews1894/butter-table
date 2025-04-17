import { describe, it, expect } from 'vitest';
import { tableReducer, createTableState, type StateAction } from './stateMachine';
import type { TableState } from './types';

describe('stateMachine', () => {
  describe('createTableState', () => {
    it('should create initial state with default values', () => {
      const state = createTableState();
      expect(state).toEqual({
        sorting: [],
        pagination: { pageIndex: 0, pageSize: 10 },
        filters: [],
        selection: [],
      });
    });

    it('should merge provided initial state with defaults', () => {
      const initialState = {
        sorting: [{ id: 'name', desc: true }],
        pagination: { pageIndex: 1, pageSize: 20 },
      };
      const state = createTableState(initialState);
      expect(state).toEqual({
        sorting: [{ id: 'name', desc: true }],
        pagination: { pageIndex: 1, pageSize: 20 },
        filters: [],
        selection: [],
      });
    });
  });

  describe('tableReducer', () => {
    const initialState: TableState = {
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 10 },
      filters: [],
      selection: [],
    };

    it('should handle SET_SORTING action', () => {
      const action: StateAction = {
        type: 'SET_SORTING',
        payload: [{ id: 'name', desc: true }],
      };
      const newState = tableReducer(initialState, action);
      expect(newState.sorting).toEqual([{ id: 'name', desc: true }]);
    });

    it('should handle SET_PAGINATION action', () => {
      const action: StateAction = {
        type: 'SET_PAGINATION',
        payload: { pageIndex: 2, pageSize: 20 },
      };
      const newState = tableReducer(initialState, action);
      expect(newState.pagination).toEqual({ pageIndex: 2, pageSize: 20 });
    });

    it('should handle SET_FILTERS action', () => {
      const action: StateAction = {
        type: 'SET_FILTERS',
        payload: [{ id: 'name', value: 'test', operator: 'contains' }],
      };
      const newState = tableReducer(initialState, action);
      expect(newState.filters).toEqual([{ id: 'name', value: 'test', operator: 'contains' }]);
    });

    it('should handle SET_SELECTION action', () => {
      const action: StateAction = {
        type: 'SET_SELECTION',
        payload: ['1', '2'],
      };
      const newState = tableReducer(initialState, action);
      expect(newState.selection).toEqual(['1', '2']);
    });

    it('should return unchanged state for unknown action', () => {
      const action = { type: 'UNKNOWN' } as any;
      const newState = tableReducer(initialState, action);
      expect(newState).toBe(initialState);
    });
  });
}); 