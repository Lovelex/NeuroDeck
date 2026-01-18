import { BrowserWindow } from 'electron';
import { store } from '../lib/store';
import { UserProgress, Question, DeckFile, SchedulerState } from '../lib/schemas';

let intervalId: NodeJS.Timeout | null = null;
let mainWindow: BrowserWindow | null = null;

// Constants
const TICK_INTERVAL_MS = 60 * 1000; // 60 seconds

export async function initScheduler(win: BrowserWindow) {
  mainWindow = win;
  if (intervalId) clearInterval(intervalId);

  // Initial check: if nextFireAt is stale (in the past), reset it to NOW+1 min so the UI updates
  // instead of showing a weird old date.
  try {
    const progress = await store.getProgress();
    if (progress.scheduler.nextFireAt && new Date(progress.scheduler.nextFireAt) < new Date()) {
      console.log('[Scheduler] Found stale nextFireAt, resetting...');
      // Reset to a short interval from now to "restart" the cycle
      const nextFire = new Date();
      nextFire.setMinutes(nextFire.getMinutes() + 1);
      progress.scheduler.nextFireAt = nextFire.toISOString();
      await store.saveProgress(progress);
    }
  } catch (err) {
    console.error('[Scheduler] Failed to perform initial check:', err);
  }

  intervalId = setInterval(tick, TICK_INTERVAL_MS);

  // Run immediately on start for dev convenience (can remove later)
  // setTimeout(tick, 5000);
  console.log('[Scheduler] Initialized');
}

export function stopScheduler() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}

export async function triggerRandomQuestion() {
  if (!mainWindow) return false;
  const progress = await store.getProgress();

  // Force trigger should bypass scheduler constraints (pause, daily limit)
  // if (!canFire(progress.scheduler)) return false;

  const selection = await selectQuestion(progress);
  if (selection) {
    await triggerInterruption(selection.deckId, selection.question);
    return true;
  }
  return false;
}

async function tick() {
  console.log('[Scheduler] Tick');
  if (!mainWindow) return;

  const progress = await store.getProgress();
  const today = new Date().toISOString().split('T')[0];

  // 1. Reset Daily Count if new day
  if (progress.scheduler.todayDate !== today) {
    progress.scheduler.todayCount = 0;
    progress.scheduler.todayDate = today;
    await store.saveProgress(progress);
  }

  // 2. Check Constraints
  if (!canFire(progress.scheduler)) {
    return;
  }

  if (progress.scheduler.nextFireAt && new Date() < new Date(progress.scheduler.nextFireAt)) {
    console.log('[Scheduler] Waiting for next fire slot', progress.scheduler.nextFireAt);
    return;
  }

  // 3. Try to pick a question
  const selection = await selectQuestion(progress);

  if (selection) {
    console.log('[Scheduler] Question Triggered!', selection.question.id);
    await triggerInterruption(selection.deckId, selection.question);
  } else {
    console.log('[Scheduler] No eligible questions found');

    // Update nextFireAt so the UI doesn't show a stale date from the past
    // ignoring the fact that we didn't find a question (maybe coincidentally)
    const nextCheck = new Date();
    // We can just bump it to the next tick or short interval
    nextCheck.setMinutes(nextCheck.getMinutes() + 1);
    progress.scheduler.nextFireAt = nextCheck.toISOString();
    await store.saveProgress(progress);
  }
}

function canFire(scheduler: SchedulerState): boolean {
  if (checkIsPaused(scheduler)) {
    console.log('[Scheduler] Paused');
    return false;
  }

  if (scheduler.todayCount >= scheduler.questionsPerDay) {
    console.log('[Scheduler] Daily limit reached');
    return false;
  }

  return true;
}

function checkIsPaused(scheduler: SchedulerState): boolean {
  if (scheduler.isPaused) {
    // Check if pause expired
    if (scheduler.pausedUntil && new Date() > new Date(scheduler.pausedUntil)) {
      // Auto resume could happen here, or we wait for user.
      // Prompt implies "pause until X", so likely we treat it as "unpaused" if time passed.
      return false;
    }
    return true;
  }
  return false;
}

async function selectQuestion(
  progress: UserProgress
): Promise<{ deckId: string; question: Question } | null> {
  const decks = await store.getDecks();
  const eligibleCandidates: Array<{ deckId: string; question: Question; weight: number }> = [];

  const now = new Date();

  for (const deckFile of decks) {
    const deckId = deckFile.deck.id;
    // Must have a valid ID and be active
    if (!deckId || !progress.decks[deckId]?.isActive) continue;

    const currentDeckId: string = deckId; // Explicit narrowing for TS

    for (const q of deckFile.questions) {
      const qId = q.id;
      if (!qId) continue;

      const qState = progress.questions[`${currentDeckId}::${qId}`];

      let isEligible = true;
      let correct = 0;
      let wrong = 0;

      if (qState) {
        correct = qState.correct;
        wrong = qState.wrong;
        if (qState.nextEligibleAt && new Date(qState.nextEligibleAt) > now) {
          isEligible = false;
        }
      }

      if (isEligible) {
        const weight = 1 + 2 * wrong + 1 * correct;

        eligibleCandidates.push({
          deckId: currentDeckId,
          question: q,
          weight,
        });
      }
    }
  }

  if (eligibleCandidates.length === 0) return null;

  // Weighted Random Selection
  const totalWeight = eligibleCandidates.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const candidate of eligibleCandidates) {
    random -= candidate.weight;
    if (random <= 0) {
      return { deckId: candidate.deckId, question: candidate.question };
    }
  }

  return eligibleCandidates[eligibleCandidates.length - 1];
}

async function triggerInterruption(deckId: string, question: Question) {
  if (!mainWindow) return;

  // Update Scheduler State (Next Fire)
  const progress = await store.getProgress();
  progress.scheduler.todayCount += 1;

  // Set next fire time based on minInterval
  const nextFire = new Date();
  nextFire.setMinutes(nextFire.getMinutes() + progress.scheduler.minIntervalMinutes);
  progress.scheduler.nextFireAt = nextFire.toISOString();

  await store.saveProgress(progress);

  // Send to Renderer
  mainWindow.webContents.send('trigger-question', { deckId, question });

  // Window Management
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Aggressive
  // On some Linux DEs, setAlwaysOnTop might need a small delay or repetition, but this is standard.
}
