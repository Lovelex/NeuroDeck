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

  // Reset state if question changes
  useEffect(() => {
    setShowExplanation(false);
  }, [question]);

  const handleAnswer = async (index: number) => {
    setShowExplanation(true);

    // Calculate if correct
    const isCorrect = index === question.answerIndex;
    try {
      if (window.electron && window.electron.question) {
        await window.electron.question.answer(deckId, question.id, isCorrect);
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
      onContinue={onComplete}
    />
  );
}
