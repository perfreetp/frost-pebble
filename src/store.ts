import type { AppState } from './types';
import { defaultState, loadState, saveState } from './storage';

type Listener = (state: AppState) => void;

class Store {
  private state: AppState = loadState();
  private listeners = new Set<Listener>();

  get(): AppState {
    return this.state;
  }

  /** 局部更新并通知、持久化 */
  update(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  mutate(fn: (draft: AppState) => void): void {
    fn(this.state);
    this.emit();
  }

  reset(): void {
    this.state = defaultState();
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    saveState(this.state);
    this.listeners.forEach((fn) => fn(this.state));
  }
}

export const store = new Store();
