import { Box, Card, CardContent, Typography, Button, Grid, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Question } from '../types';
import { useEffect } from 'react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  showExplanation: boolean;
  isCorrect?: boolean | null;
  onContinue: () => void;
}

export function QuestionCard({
  question,
  onAnswer,
  showExplanation,
  isCorrect,
  onContinue,
}: QuestionCardProps) {
  // Keyboard access
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showExplanation) {
        if (e.key === 'Enter') onContinue();
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        onAnswer(parseInt(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showExplanation, onAnswer, onContinue]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pl: 0,
        bgcolor: 'background.default',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Fade in={true} timeout={300}>
        <Card sx={{ maxWidth: 700, width: '90%', p: 2, boxShadow: 6 }}>
          <CardContent>
            {/* Topic Tag */}
            <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.5 }}>
              {question.topic.toUpperCase()}
            </Typography>

            {/* Question Text */}
            <Typography variant="h5" sx={{ mt: 2, mb: 4, fontWeight: 500, lineHeight: 1.4 }}>
              {question.question}
            </Typography>

            {/* Answer Options */}
            {!showExplanation && (
              <Grid container spacing={2}>
                {question.choices.map((choice, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => onAnswer(idx)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 2,
                        px: 3,
                        borderColor: 'divider',
                        color: 'text.primary',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        ':hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(59, 130, 246, 0.05)'
                        },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          mr: 2,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '6px',
                          minWidth: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box component="span" sx={{ flex: 1 }}>
                        {choice}
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Explanation / Result */}
            {showExplanation && (
              <Fade in={true}>
                <Box>
                  {isCorrect !== null && isCorrect !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      {isCorrect ? (
                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: 28 }} />
                      ) : (
                        <CancelIcon sx={{ color: '#EF4444', fontSize: 28 }} />
                      )}
                      <Typography
                        variant="h6"
                        sx={{
                          color: isCorrect ? '#10B981' : '#EF4444',
                          fontWeight: 700,
                        }}
                      >
                        {isCorrect ? 'Correto' : 'Incorreto'}
                      </Typography>
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
                  >
                    {question.explanation}
                  </Typography>
                  <Button variant="contained" fullWidth onClick={onContinue} sx={{ py: 1.5, borderRadius: '12px' }}>
                    Continuar (Enter)
                  </Button>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
