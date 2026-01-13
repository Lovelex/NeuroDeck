import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionCard } from '../../../src/components/QuestionCard';

describe('QuestionCard Component', () => {
  const mockQuestion = {
    id: 'q-1',
    topic: 'Physics',
    question: 'Speed of light?',
    choices: ['300k', '150k', '1M', 'None'],
    answerIndex: 0,
    explanation: 'Fundamental constant c.',
  };

  it('renders question text and choice buttons', () => {
    render(
      <QuestionCard
        question={mockQuestion as any}
        onAnswer={() => {}}
        showExplanation={false}
        onContinue={() => {}}
      />
    );

    expect(screen.getByText('PHYSICS')).toBeInTheDocument();
    expect(screen.getByText('Speed of light?')).toBeInTheDocument();
    expect(screen.getByText('300k')).toBeInTheDocument();
  });

  it('calls onAnswer when a choice is clicked', () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion as any}
        onAnswer={onAnswer}
        showExplanation={false}
        onContinue={() => {}}
      />
    );

    fireEvent.click(screen.getByText('300k'));
    expect(onAnswer).toHaveBeenCalledWith(0);
  });

  it('shows explanation and continue button when showExplanation is true', () => {
    render(
      <QuestionCard
        question={mockQuestion as any}
        onAnswer={() => {}}
        showExplanation={true}
        onContinue={() => {}}
      />
    );

    expect(screen.getByText('Fundamental constant c.')).toBeInTheDocument();
    expect(screen.getByText(/Continue/)).toBeInTheDocument();
    // Buttons should be hidden
    expect(screen.queryByText('300k')).not.toBeInTheDocument();
  });
});
