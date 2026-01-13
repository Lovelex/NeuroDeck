import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Electron window object
(window as any).electron = {
  deck: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    import: vi.fn(),
    toggleActive: vi.fn(),
  },
  settings: {
    get: vi.fn(),
    update: vi.fn(),
  },
  onQuestionTriggered: vi.fn(),
  question: {
    answer: vi.fn(),
  },
  debug: {
    triggerQuestion: vi.fn(),
  },
} as any;
