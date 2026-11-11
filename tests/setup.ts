import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up rendered React trees after each test
afterEach(() => {
  cleanup();
});

// Polyfill ResizeObserver for jsdom environment (required by Recharts ResponsiveContainer & layout panels)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverMock as any;

// Polyfill IntersectionObserver for lazy/viewport loading
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.IntersectionObserver = IntersectionObserverMock as any;

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })),
});

// Polyfill window.scrollTo
window.scrollTo = vi.fn();

// Polyfill URL.createObjectURL and URL.revokeObjectURL for CSV/PDF report downloads and file uploads
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}

// Polyfill HTMLCanvasElement.prototype.getContext for gauges and canvas sparklines
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}) as any;

// Polyfill Web Worker for jsdom environment
export class MockWorker {
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onmessageerror: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: ErrorEvent) => any) | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(public url?: string | URL, public options?: WorkerOptions) {}

  postMessage(message: any, transfer?: Transferable[]): void {
    queueMicrotask(() => {
      try {
        const response = {
          id: message?.id ?? 'req-1',
          type: 'SUCCESS',
          payload: { processed: true, echo: message },
        };
        const event = new MessageEvent('message', { data: response });
        if (this.onmessage) (this.onmessage as any).call(this as any, event);
        this.dispatchEvent(event);
      } catch (err: any) {
        const errorResponse = {
          id: message?.id ?? 'req-1',
          type: 'ERROR',
          payload: err?.message || 'Worker simulation error',
        };
        const event = new MessageEvent('message', { data: errorResponse });
        if (this.onmessage) (this.onmessage as any).call(this as any, event);
        this.dispatchEvent(event);
      }
    });
  }

  terminate(): void {
    this.listeners.clear();
  }

  addEventListener(type: string, listener: any): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: any): void {
    const list = this.listeners.get(type);
    if (list) {
      this.listeners.set(type, list.filter((l) => l !== listener));
    }
  }

  dispatchEvent(event: Event): boolean {
    const list = this.listeners.get(event.type) || [];
    list.forEach((l) => l(event));
    return true;
  }
}

if (typeof globalThis.Worker === 'undefined') {
  globalThis.Worker = MockWorker as any;
}
