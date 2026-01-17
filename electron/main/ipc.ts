import { ipcMain, dialog } from 'electron';
import { store } from '../lib/store';
import { DeckFile, DeckFilesSchema } from '../lib/schemas';
import crypto from 'crypto';
import parseJson = require('json-parse-even-better-errors');

async function processImport(data: string) {
  const rawData = data.trim();
  if (!rawData) return { success: false, error: 'Empty input' };

  try {
    // 1. Syntax Validation
    const json = parseJson(rawData);

    // 2. Schema Validation
    const parsed = DeckFilesSchema.safeParse(json);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid structure: ${parsed.error.message}`
      };
    }

    const decksToSave = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const now = new Date().toISOString();

    for (const deck of decksToSave) {
      // 3. Generate missing IDs and Metadata
      if (!deck.deck.id) deck.deck.id = crypto.randomUUID();
      if (!deck.deck.createdAt) deck.deck.createdAt = now;
      if (!deck.deck.updatedAt) deck.deck.updatedAt = now;

      deck.questions = deck.questions.map(q => ({
        ...q,
        id: q.id || crypto.randomUUID()
      }));

      await store.saveDeck(deck as DeckFile);
    }

    return { success: true, count: decksToSave.length };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}

export function setupIpc() {
  ipcMain.handle('deck:list', async () => {
    return await store.getDecks();
  });

  ipcMain.handle(
    'deck:create',
    async (_, { name, description }: { name: string; description: string }) => {
      const newDeck: DeckFile = {
        deck: {
          id: crypto.randomUUID(),
          name,
          description,
          tags: [],
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        questions: [],
      };
      await store.saveDeck(newDeck);
      return newDeck;
    }
  );

  ipcMain.handle('deck:update', async (_, deck: DeckFile) => {
    deck.deck.updatedAt = new Date().toISOString();
    await store.saveDeck(deck);
    return deck;
  });

  ipcMain.handle('deck:delete', async (_, deckId: string) => {
    await store.deleteDeck(deckId);
    return true;
  });

  // Import from File
  ipcMain.handle('deck:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (canceled || filePaths.length === 0) return { success: false, canceled: true };

    try {
      const fs = require('fs/promises');
      const data = await fs.readFile(filePaths[0], 'utf-8');
      return await processImport(data);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Import from Text (Terminal-like)
  ipcMain.handle('deck:import-text', async (_, text: string) => {
    return await processImport(text);
  });

  // Export All Decks
  ipcMain.handle('deck:export-all', async () => {
    try {
      const decks = await store.getDecks();
      if (decks.length === 0) return { success: false, error: 'No decks to export' };

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export All Decks',
        defaultPath: 'neurodeck-backup.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (canceled || !filePath) return { success: false, canceled: true };

      const fs = require('fs/promises');
      await fs.writeFile(filePath, JSON.stringify(decks, null, 2), 'utf-8');

      return { success: true };
    } catch (error: any) {
      console.error('[Export Error]', error);
      return { success: false, error: error.message };
    }
  });

  // Settings & Progress
  ipcMain.handle('settings:get', async () => {
    return await store.getProgress();
  });

  ipcMain.handle('settings:update', async (_, newSettings) => {
    const progress = await store.getProgress();

    if (newSettings.minIntervalMinutes !== undefined || newSettings.questionsPerDay !== undefined || newSettings.isPaused !== undefined) {
      progress.scheduler = { ...progress.scheduler, ...newSettings };
    }

    if (newSettings.itemsPerPageDecks !== undefined || newSettings.itemsPerPageQuestions !== undefined) {
      progress.preferences = { ...progress.preferences, ...newSettings };
    }

    await store.saveProgress(progress);
    return progress;
  });

  ipcMain.handle(
    'deck:toggleActive',
    async (_, { deckId, isActive }: { deckId: string; isActive: boolean }) => {
      const progress = await store.getProgress();
      if (!progress.decks[deckId]) {
        progress.decks[deckId] = { isActive };
      } else {
        progress.decks[deckId].isActive = isActive;
      }
      await store.saveProgress(progress);
      return true;
    }
  );

  ipcMain.handle(
    'question:answer',
    async (
      _,
      { questionId, deckId, isCorrect }: { questionId: string; deckId: string; isCorrect: boolean }
    ) => {
      const progress = await store.getProgress();

      const current = progress.questions[questionId] || {
        seen: 0,
        correct: 0,
        wrong: 0,
        lastAnsweredAt: null,
        nextEligibleAt: null,
      };

      current.seen += 1;
      if (isCorrect) current.correct += 1;
      else current.wrong += 1;

      current.lastAnsweredAt = new Date().toISOString();

      const waitMinutes = isCorrect ? 120 : 15;
      const nextDate = new Date();
      nextDate.setMinutes(nextDate.getMinutes() + waitMinutes);
      current.nextEligibleAt = nextDate.toISOString();

      progress.questions[questionId] = current;

      await store.saveProgress(progress);
      return true;
    }
  );

  // Development only: Trigger a random question
  ipcMain.handle('debug:trigger-question', async () => {
    const { triggerRandomQuestion } = require('./scheduler');
    return await triggerRandomQuestion();
  });
}
