import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

// Ensure we use the user data directory for all storage
export const DATA_DIR = app.getPath('userData');
export const DECKS_DIR = path.join(DATA_DIR, 'decks');
export const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

export async function ensureDirs() {
  await fs.mkdir(DECKS_DIR, { recursive: true });
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    return null;
  }
}

export async function writeJson(filePath: string, data: any): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

export async function listDecksFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(DECKS_DIR);
    return files.filter((f) => f.endsWith('.json')).map((f) => path.join(DECKS_DIR, f));
  } catch {
    return [];
  }
}
