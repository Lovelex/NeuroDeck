import { ipcMain, dialog } from 'electron';
import { store } from '../lib/store';
import { DeckFile, DeckFileSchema } from '../lib/schemas';
import crypto from 'crypto';
import path from 'path';

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

  // Placeholder for import/export
  ipcMain.handle('deck:import', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (canceled || filePaths.length === 0) {
      return false;
    }

    try {
      const fs = require('fs/promises');
      const data = await fs.readFile(filePaths[0], 'utf-8');
      const json = JSON.parse(data);

      // Validate against schema
      const parsed = DeckFileSchema.safeParse(json);
      if (!parsed.success) {
        console.error('Invalid deck file:', parsed.error);
        // In a real app we might return error details, but MVP: return false
        return false;
      }

      // Save to our decks store
      await store.saveDeck(parsed.data);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  });

  // Settings & Progress
  ipcMain.handle('settings:get', async () => {
    return await store.getProgress();
  });

  ipcMain.handle('settings:update', async (_, newSettings) => {
    // We need to implement partial updates deeply or just replace.
    // For now handle scheduler update.
    const progress = await store.getProgress();
    progress.scheduler = { ...progress.scheduler, ...newSettings };
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

      // Record the answer
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

      // Very basic SRS: if correct, wait 2h. If wrong, wait 15m.
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
