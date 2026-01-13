import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataStore } from '../../../electron/lib/store';
import * as fs from '../../../electron/lib/fs';

// Mock fs module
vi.mock('../../../electron/lib/fs', () => ({
  readJson: vi.fn(),
  writeJson: vi.fn(),
  ensureDirs: vi.fn(),
  listDecksFiles: vi.fn(),
  PROGRESS_FILE: 'mock-progress.json',
  DECKS_DIR: 'mock-decks-dir',
}));

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new DataStore();
  });

  it('should initialize with default progress if file missing', async () => {
    vi.mocked(fs.readJson).mockResolvedValue(null);

    await store.init();

    expect(fs.ensureDirs).toHaveBeenCalled();
    expect(fs.writeJson).toHaveBeenCalledWith(
      'mock-progress.json',
      expect.objectContaining({
        schemaVersion: 1,
        scheduler: expect.any(Object),
      })
    );
  });

  it('should return progress from file if available', async () => {
    const mockProgress = {
      schemaVersion: 1,
      decks: {},
      questions: {},
      scheduler: {
        isPaused: false,
        pausedUntil: null,
        questionsPerDay: 20,
        minIntervalMinutes: 15,
        nextFireAt: new Date().toISOString(),
        todayCount: 0,
        todayDate: '2024-01-01',
      },
    };
    vi.mocked(fs.readJson).mockResolvedValue(mockProgress);

    const progress = await store.getProgress();

    expect(progress.scheduler.todayDate).toBe('2024-01-01');
  });

  it('should save deck to correct path', async () => {
    const mockDeck: any = {
      deck: {
        id: 'test-deck',
        name: 'Test',
        description: 'Test Desc',
        tags: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      questions: [],
    };

    await store.saveDeck(mockDeck);

    expect(fs.writeJson).toHaveBeenCalledWith(expect.stringContaining('test-deck.json'), mockDeck);
  });

  it('should list and load valid decks only', async () => {
    vi.mocked(fs.listDecksFiles).mockResolvedValue(['deck1.json', 'deck2.json']);

    const validDeck = {
      deck: {
        id: 'd1',
        name: 'Valid',
        tags: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: '',
      },
      questions: [],
    };

    vi.mocked(fs.readJson)
      .mockResolvedValueOnce(validDeck) // first call
      .mockResolvedValueOnce({ invalid: 'deck' }); // second call

    const decks = await store.getDecks();

    expect(decks).toHaveLength(1);
    expect(decks[0].deck.name).toBe('Valid');
  });
});
