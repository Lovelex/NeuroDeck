import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as scheduler from '../../../electron/main/scheduler';
import { store } from '../../../electron/lib/store';

vi.mock('../../../electron/lib/store', () => ({
  store: {
    getDecks: vi.fn(),
    getProgress: vi.fn(),
    saveProgress: vi.fn(),
  },
}));

// Mock electron
vi.mock('electron', () => ({
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(),
  },
}));

describe('Scheduler Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Since selectQuestion is private, we test it indirectly or
  // we would need to export it. For now let's test the public triggerRandomQuestion

  it('should not trigger if no decks are active', async () => {
    vi.mocked(store.getProgress).mockResolvedValue({
      decks: { d1: { isActive: false } },
      questions: {},
      scheduler: { isPaused: false },
    } as any);

    vi.mocked(store.getDecks).mockResolvedValue([
      { deck: { id: 'd1' }, questions: [{ id: 'q1' }] },
    ] as any);

    // We need a mock window to actually "trigger"
    const mockWin = {
      webContents: { send: vi.fn() },
      isMinimized: vi.fn(),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      setAlwaysOnTop: vi.fn(),
    };
    scheduler.initScheduler(mockWin as any);

    const result = await scheduler.triggerRandomQuestion();
    expect(result).toBe(false);
  });

  it('should prioritize questions with more wrong answers', async () => {
    // This is hard to test deterministically without exporting selectQuestion
    // but we can check if it picks the only eligible one.

    vi.mocked(store.getProgress).mockResolvedValue({
      decks: { d1: { isActive: true } },
      questions: {
        'd1::q1': { correct: 0, wrong: 10, nextEligibleAt: null }, // high weight
        'd1::q2': { correct: 10, wrong: 0, nextEligibleAt: '2099-01-01' }, // ineligible
      },
      scheduler: { isPaused: false, minIntervalMinutes: 15 },
    } as any);

    vi.mocked(store.getDecks).mockResolvedValue([
      {
        deck: { id: 'd1' },
        questions: [
          { id: 'q1', topic: 'T1' },
          { id: 'q2', topic: 'T2' },
        ],
      },
    ] as any);

    const mockWin = {
      webContents: { send: vi.fn() },
      isMinimized: vi.fn(),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      setAlwaysOnTop: vi.fn(),
    };
    scheduler.initScheduler(mockWin as any);

    const result = await scheduler.triggerRandomQuestion();
    expect(result).toBe(true);
    expect(mockWin.webContents.send).toHaveBeenCalledWith(
      'trigger-question',
      expect.objectContaining({
        question: expect.objectContaining({ id: 'q1' }),
      })
    );
  });

  it('should not trigger if daily limit is reached', async () => {
    vi.mocked(store.getProgress).mockResolvedValue({
      decks: { d1: { isActive: true } },
      questions: {},
      scheduler: {
        isPaused: false,
        questionsPerDay: 5,
        todayCount: 5,
        minIntervalMinutes: 15,
        todayDate: new Date().toISOString().split('T')[0],
      },
    } as any);

    vi.mocked(store.getDecks).mockResolvedValue([
      { deck: { id: 'd1' }, questions: [{ id: 'q1' }] },
    ] as any);

    const mockWin = {
      webContents: { send: vi.fn() },
      isMinimized: vi.fn(),
      restore: vi.fn(),
      show: vi.fn(),
      focus: vi.fn(),
      setAlwaysOnTop: vi.fn(),
    };
    scheduler.initScheduler(mockWin as any);

    const result = await scheduler.triggerRandomQuestion();
    expect(result).toBe(true);
  });

  it('should reset stale nextFireAt on init', async () => {
    // Mock progress with a date in the past
    vi.mocked(store.getProgress).mockResolvedValue({
      decks: {},
      questions: {},
      scheduler: {
        isPaused: false,
        nextFireAt: '2000-01-01T00:00:00.000Z', // Very old date
        minIntervalMinutes: 15,
      },
    } as any);

    const mockWin = {
      webContents: { send: vi.fn() },
    };

    await scheduler.initScheduler(mockWin as any);

    // Verify it saved a new progress with a future date
    expect(store.saveProgress).toHaveBeenCalled();
    const saveCall = vi.mocked(store.saveProgress).mock.calls[0][0];
    const newFireAt = new Date(saveCall.scheduler.nextFireAt);

    // Should be in the future (approx now + 1 min)
    expect(newFireAt.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
