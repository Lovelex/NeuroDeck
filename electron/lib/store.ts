import { readJson, writeJson, ensureDirs, DECKS_DIR, PROGRESS_FILE, listDecksFiles } from './fs';
import { DeckFileSchema, UserProgressSchema, DeckFile, UserProgress } from './schemas';
import path from 'path';

const INITIAL_PROGRESS: UserProgress = {
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
    todayDate: new Date().toISOString().split('T')[0],
  },
  preferences: {
    itemsPerPageDecks: 10,
    itemsPerPageQuestions: 20
  },
};

export class DataStore {
  constructor() { }

  async init() {
    await ensureDirs();
    const progress = await readJson(PROGRESS_FILE);
    if (!progress) {
      await writeJson(PROGRESS_FILE, INITIAL_PROGRESS);
    }
  }

  async getProgress(): Promise<UserProgress> {
    const data = await readJson(PROGRESS_FILE);
    const parsed = UserProgressSchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    // Fallback or repair logic could go here
    return INITIAL_PROGRESS;
  }

  async saveProgress(progress: UserProgress): Promise<void> {
    const parsed = UserProgressSchema.parse(progress);
    await writeJson(PROGRESS_FILE, parsed);
  }

  async getDecks(): Promise<DeckFile[]> {
    const files = await listDecksFiles();
    const decks: DeckFile[] = [];
    for (const file of files) {
      const data = await readJson(file);
      const parsed = DeckFileSchema.safeParse(data);
      if (parsed.success) {
        decks.push(parsed.data);
      }
    }
    return decks;
  }

  async saveDeck(deck: DeckFile): Promise<void> {
    const filePath = path.join(DECKS_DIR, `${deck.deck.id}.json`);
    const parsed = DeckFileSchema.parse(deck);
    await writeJson(filePath, parsed);
  }

  async deleteDeck(deckId: string): Promise<void> {
    const filePath = path.join(DECKS_DIR, `${deckId}.json`);
    // Simple unlink, catch error if missing
    const fs = require('fs/promises');
    await fs.unlink(filePath).catch(() => { });
  }
}

export const store = new DataStore();
