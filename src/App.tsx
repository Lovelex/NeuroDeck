import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MainPage } from './pages/MainPage';
import { QuestionView } from './pages/QuestionView';
import { Question } from './types';

// Design System Colors
const designSystem = {
  bgPrimary: '#0B0F1A',
  bgSecondary: '#111827',
  bgSurface: '#161E2E',
  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  accentPrimary: '#3B82F6',
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: designSystem.accentPrimary,
    },
    background: {
      default: designSystem.bgPrimary,
      paper: designSystem.bgSurface,
    },
    text: {
      primary: designSystem.textPrimary,
      secondary: designSystem.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  const [activeQuestion, setActiveQuestion] = useState<{
    question: Question;
    deckId: string;
  } | null>(null);

  useEffect(() => {
    // Listen for questions
    if (window.electron && window.electron.onQuestionTriggered) {
      window.electron.onQuestionTriggered((question, deckId) => {
        console.log('Triggered!', question);
        setActiveQuestion({ question, deckId });
      });
    }
  }, []);

  const handleComplete = () => {
    setActiveQuestion(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {activeQuestion ? (
        <QuestionView
          question={activeQuestion.question}
          deckId={activeQuestion.deckId}
          onComplete={handleComplete}
        />
      ) : (
        <MainPage />
      )}
    </ThemeProvider>
  );
}

export default App;
