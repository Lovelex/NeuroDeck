import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answerIndex: z.number().min(0).max(3),
  explanation: z.string(),
  tags: z.array(z.string()).optional(),
  needsReview: z.boolean().optional(),
});

export const DeckMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  version: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const DeckFileSchema = z.object({
  deck: DeckMetadataSchema,
  questions: z.array(QuestionSchema),
});

export const ProgressDeckSchema = z.object({
  isActive: z.boolean(),
});

export const ProgressQuestionSchema = z.object({
  seen: z.number(),
  correct: z.number(),
  wrong: z.number(),
  lastAnsweredAt: z.string().datetime().nullable(),
  nextEligibleAt: z.string().datetime().nullable(),
});

export const SchedulerStateSchema = z.object({
  isPaused: z.boolean(),
  pausedUntil: z.string().datetime().nullable(),
  questionsPerDay: z.number(),
  minIntervalMinutes: z.number(),
  nextFireAt: z.string().datetime().nullable(),
  todayCount: z.number(),
  todayDate: z.string(), // YYYY-MM-DD
});

export const UserProgressSchema = z.object({
  schemaVersion: z.number(),
  decks: z.record(z.string(), ProgressDeckSchema),
  questions: z.record(z.string(), ProgressQuestionSchema),
  scheduler: SchedulerStateSchema,
});

export type Question = z.infer<typeof QuestionSchema>;
export type DeckMetadata = z.infer<typeof DeckMetadataSchema>;
export type DeckFile = z.infer<typeof DeckFileSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
export type SchedulerState = z.infer<typeof SchedulerStateSchema>;
