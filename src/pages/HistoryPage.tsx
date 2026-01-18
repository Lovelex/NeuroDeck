import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Card, Alert } from '@mui/material';
import { UserProgress } from '../types';

export function HistoryPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [deckLookup, setDeckLookup] = useState<Record<string, string>>({}); // qId -> question text
  const [deckNameLookup, setDeckNameLookup] = useState<Record<string, string>>({}); // dId -> deck name
  const [error, setError] = useState<string | null>(null);

  const isElectron = !!window.electron;

  useEffect(() => {
    if (isElectron) {
      window.electron.settings
        .get()
        .then(setProgress)
        .catch(() => setError('Erro ao carregar histórico.'));

      window.electron.deck.list().then((decks: any[]) => {
        const qLookup: Record<string, string> = {};
        const dLookup: Record<string, string> = {};
        decks.forEach(d => {
          dLookup[d.deck.id] = d.deck.name;
          d.questions.forEach((q: any) => {
            qLookup[q.id] = q.question;
          });
        });
        setDeckLookup(qLookup);
        setDeckNameLookup(dLookup);
      });
    } else {
      setError('Electron API não detectada.');
    }
  }, [isElectron]);

  const historyItems = progress
    ? Object.entries(progress.questions)
      .filter(([_, data]) => data.lastAnsweredAt)
      .sort(
        (a, b) =>
          new Date(b[1].lastAnsweredAt).getTime() - new Date(a[1].lastAnsweredAt).getTime()
      )
      .slice(0, 50)
    : [];

  if (error && !isElectron) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Histórico
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Lista das últimas questões respondidas e seu desempenho técnico.
      </Typography>

      <Box sx={{ mt: 2 }}>
        {historyItems.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary">Nenhuma atividade registrada ainda.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {historyItems.map(([key, data]) => {
              // Handle old format (qId only) and new format (deckId::qId)
              const parts = key.split('::');
              const qId = parts.length > 1 ? parts[1] : parts[0];
              const deckId = parts.length > 1 ? parts[0] : 'Desconhecido';

              return (
                <Card
                  variant="outlined"
                  sx={{ mb: 2, bgcolor: 'background.paper', backgroundImage: 'none' }}
                  key={key}
                >
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {deckLookup[qId] || qId}
                          </Typography>
                        </Box>
                      }
                      secondary={`Respondida em: ${new Date(data.lastAnsweredAt!).toLocaleString()}`}
                    />
                    <Stack direction="row" spacing={1}>
                      <Chip label={`${data.seen} visualizações`} size="small" variant="outlined" />
                      {data.correct > 0 && (
                        <Chip
                          label={`${data.correct} acertos`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      {data.wrong > 0 && (
                        <Chip
                          label={`${data.wrong} erros`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </ListItem>
                </Card>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}

import { Stack } from '@mui/material';
