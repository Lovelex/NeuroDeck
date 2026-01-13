export interface Question {
  id: string;
  topic: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  tags?: string[];
  needsReview?: boolean;
}

export interface DeckMetadata {
  id: string;
  name: string;
  description: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeckFile {
  deck: DeckMetadata;
  questions: Question[];
}

export interface SchedulerState {
  isPaused: boolean;
  pausedUntil: string | null;
  questionsPerDay: number;
  minIntervalMinutes: number;
  nextFireAt: string | null;
  todayCount: number;
  todayDate: string;
}

export interface UserProgress {
  schemaVersion: number;
  decks: Record<string, { isActive: boolean }>;
  questions: Record<string, any>;
  scheduler: SchedulerState;
}
