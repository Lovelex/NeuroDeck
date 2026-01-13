import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeckCard } from '../../../src/components/DeckCard';

describe('DeckCard Component', () => {
  const mockDeck = {
    id: 'deck-1',
    name: 'TypeScript Mastery',
    description: 'Master advanced TS patterns',
    tags: ['coding', 'ts'],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders deck information correctly', () => {
    render(
      <DeckCard
        deck={mockDeck}
        questionCount={15}
        isActive={true}
        onToggle={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText('TypeScript Mastery')).toBeInTheDocument();
    expect(screen.getByText('Master advanced TS patterns')).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/questões/)).toBeInTheDocument();
  });

  it('calls onToggle when switch is clicked', () => {
    const onToggle = vi.fn();
    render(
      <DeckCard
        deck={mockDeck}
        questionCount={15}
        isActive={false}
        onToggle={onToggle}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
