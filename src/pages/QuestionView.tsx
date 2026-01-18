import { useState, useEffect } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import { Question } from '../types';

interface QuestionViewProps {
  question: Question;
  deckId: string;
  onComplete: () => void;
}

export function QuestionView({ question, deckId, onComplete }: QuestionViewProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Reset state if question changes
  useEffect(() => {
    setShowExplanation(false);
    setIsCorrect(null);
  }, [question]);

  const handleAnswer = async (index: number) => {
    setShowExplanation(true);

    // Calculate if correct
    const correct = index === question.answerIndex;
    setIsCorrect(correct);
    try {
      if (window.electron && window.electron.question) {
        await window.electron.question.answer(deckId, question.id, correct);
      } else {
        console.warn('Electron API not available');
      }
    } catch (e) {
      console.error('Failed to submit answer', e);
    }
  };

  return (
    <QuestionCard
      question={question}
      onAnswer={handleAnswer}
      showExplanation={showExplanation}
      isCorrect={isCorrect}
      onContinue={onComplete}
    />
  );
}
