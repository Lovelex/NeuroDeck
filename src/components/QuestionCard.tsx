import { Box, Card, CardContent, Typography, Button, Grid, Fade } from '@mui/material';
import { Question } from '../types';
import { useEffect } from 'react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (index: number) => void;
  showExplanation: boolean;
  onContinue: () => void;
}

export function QuestionCard({
  question,
  onAnswer,
  showExplanation,
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
        bgcolor: 'background.default',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <Fade in={true} timeout={300}>
        <Card sx={{ maxWidth: 600, width: '90%', p: 2, boxShadow: 6 }}>
          <CardContent>
            {/* Topic Tag */}
            <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.5 }}>
              {question.topic.toUpperCase()}
            </Typography>

            {/* Question Text */}
            <Typography variant="h5" sx={{ mt: 2, mb: 4, fontWeight: 500 }}>
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
                        py: 1.5,
                        borderColor: 'divider',
                        color: 'text.primary',
                        ':hover': { borderColor: 'primary.main' },
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
                          borderRadius: 1,
                          width: 24,
                          textAlign: 'center',
                        }}
                      >
                        {idx + 1}
                      </Box>
                      {choice}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Explanation / Result */}
            {showExplanation && (
              <Fade in={true}>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
                  >
                    {question.explanation}
                  </Typography>
                  <Button variant="contained" fullWidth onClick={onContinue}>
                    Continue (Enter)
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
