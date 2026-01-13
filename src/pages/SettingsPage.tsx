import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import SaveIcon from '@mui/icons-material/Save';
import { UserProgress } from '../types';

export function SettingsPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local state for inputs
  const [interval, setInterval] = useState<number>(15);
  const [limit, setLimit] = useState<number>(20);

  const isElectron = !!window.electron;

  const loadData = async () => {
    if (!isElectron) {
      setError('Electron API não detectada.');
      return;
    }
    try {
      const fetchedProgress = await window.electron.settings.get();
      if (fetchedProgress) {
        setProgress(fetchedProgress);
        setInterval(fetchedProgress.scheduler.minIntervalMinutes);
        setLimit(fetchedProgress.scheduler.questionsPerDay);
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar configurações.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!progress || !isElectron) return;

    const newScheduler = {
      ...progress.scheduler,
      minIntervalMinutes: interval,
      questionsPerDay: limit,
    };

    await window.electron.settings.update(newScheduler);
    loadData();
  };

  const handleTriggerQuestion = async () => {
    if (!isElectron) return;
    await window.electron.debug.triggerQuestion();
  };

  if (error && !isElectron) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h4" gutterBottom fontWeight="800" letterSpacing="-1.5px">
        Configurações
      </Typography>

      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid item xs={12} md={7}>
          <Card
            variant="outlined"
            sx={{ bgcolor: 'background.paper', backgroundImage: 'none', borderRadius: '16px' }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="700">
                Configurações do Agendador
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Customize como e quando o NeuroDeck deve interromper seu fluxo de trabalho.
              </Typography>

              <Stack spacing={4}>
                <TextField
                  label="Intervalo Mínimo entre Questões (Minutos)"
                  type="number"
                  fullWidth
                  variant="filled"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                />
                <TextField
                  label="Limite de Questões por Dia"
                  type="number"
                  fullWidth
                  variant="filled"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ borderRadius: '10px', px: 4 }}
                  >
                    Salvar Configurações
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <BugReportIcon sx={{ color: '#EF4444' }} />
                  <Typography variant="h6" fontWeight="700" color="error">
                    Zona de Desenvolvimento
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Utilize estas ferramentas para testar o comportamento do sistema sem precisar
                  esperar o tempo do agendador.
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleTriggerQuestion}
                  sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    fontWeight: 700,
                    borderWidth: '2px',
                    '&:hover': { borderWidth: '2px' },
                  }}
                >
                  FORÇAR EXIBIÇÃO DE QUESTÃO
                </Button>

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}
                >
                  PRÓXIMA JANELA ESTIMADA:
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  {progress?.scheduler.nextFireAt
                    ? new Date(progress.scheduler.nextFireAt).toLocaleString()
                    : 'Não agendada'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
