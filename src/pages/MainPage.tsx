import { useState } from 'react';
import { Box } from '@mui/material';
import { Layout } from '../components/Layout';
import { DecksView } from './DecksView';
import { HistoryPage } from './HistoryPage';
import { SettingsPage } from './SettingsPage';
import { DeckQuestionsView } from './DeckQuestionsView';

export type View = 'decks' | 'history' | 'settings' | 'deck-questions';

export function MainPage() {
  const [currentView, setCurrentView] = useState<View>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const navigateToQuestions = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentView('deck-questions');
  };

  const renderView = () => {
    switch (currentView) {
      case 'decks':
        return <DecksView onManageQuestions={navigateToQuestions} />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'deck-questions':
        return selectedDeckId ? (
          <DeckQuestionsView deckId={selectedDeckId} onBack={() => setCurrentView('decks')} />
        ) : null;
      default:
        return <DecksView onManageQuestions={navigateToQuestions} />;
    }
  };

  return (
    <Layout
      currentView={currentView === 'deck-questions' ? 'decks' : (currentView as any)}
      onNavigate={(view) => setCurrentView(view)}
    >
      <Box sx={{ p: 4 }}>{renderView()}</Box>
    </Layout>
  );
}
