import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Stack,
  Card,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DeckFile, Question, UserProgress } from '../types';

interface DeckQuestionsViewProps {
  deckId: string;
  onBack: () => void;
}

export function DeckQuestionsView({ deckId, onBack }: DeckQuestionsViewProps) {
  const [deckFile, setDeckFile] = useState<DeckFile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = progress?.preferences.itemsPerPageQuestions || 20;

  const loadDeck = async () => {
    try {
      setLoading(true);
      const [decks, fetchedProgress] = await Promise.all([
        window.electron.deck.list(),
        window.electron.settings.get(),
      ]);
      setProgress(fetchedProgress);
      const found = decks.find((d) => d.deck.id === deckId);
      if (found) {
        setDeckFile(JSON.parse(JSON.stringify(found)));
      } else {
        setError('Deck não encontrado.');
      }
    } catch (err) {
      setError('Falha ao carregar questões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const handleSave = async () => {
    if (!deckFile) return;
    try {
      setSaving(true);
      await window.electron.deck.update(deckFile);
      setSaving(false);
    } catch (err) {
      setError('Erro ao salvar.');
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!deckFile) return;
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 11),
      topic: '',
      question: '',
      choices: ['', '', '', ''],
      answerIndex: 0,
      explanation: '',
      tags: [],
      needsReview: false,
    };
    setDeckFile({
      ...deckFile,
      questions: [newQuestion, ...deckFile.questions],
    });
  };

  const handleUpdate = (index: number, field: keyof Question, value: any) => {
    if (!deckFile) return;
    const questions = [...deckFile.questions];
    questions[index] = { ...questions[index], [field]: value };
    setDeckFile({ ...deckFile, questions });
  };

  const handleUpdateChoice = (qIndex: number, cIndex: number, value: string) => {
    if (!deckFile) return;
    const questions = [...deckFile.questions];
    const choices = [...questions[qIndex].choices];
    choices[cIndex] = value;
    questions[qIndex] = { ...questions[qIndex], choices };
    setDeckFile({ ...deckFile, questions });
  };

  const handleRemove = (index: number) => {
    if (!deckFile) return;
    const questions = deckFile.questions.filter((_, i) => i !== index);
    setDeckFile({ ...deckFile, questions });
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={onBack}>Voltar</Button>
      </Box>
    );
  if (!deckFile) return null;

  const paginatedQuestions = deckFile.questions.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(deckFile.questions.length / itemsPerPage);

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', pb: 8, pt: 4 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}
      >
        <Stack spacing={0.5}>
          <Breadcrumbs sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 1 }}>
            <Link
              underline="hover"
              color="inherit"
              onClick={onBack}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            >
              DECKS
            </Link>
            <Typography color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {deckFile.deck.name.toUpperCase()}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight="800" letterSpacing="-1.5px">
            Editor de Questões
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ px: 4, borderRadius: '12px', fontWeight: 600 }}
          >
            Salvar Alterações
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(59, 130, 246, 0.05)',
          p: 2,
          borderRadius: '12px',
          border: '1px dashed rgba(59, 130, 246, 0.2)',
        }}
      >
        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
          {deckFile.questions.length} questões neste deck
        </Typography>
        <Button
          variant="text"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
          sx={{ fontWeight: 700 }}
        >
          ADICIONAR NOVA PERGUNTA
        </Button>
      </Box>

      <Stack spacing={4}>
        {paginatedQuestions.map((q, localIdx) => {
          const globalIdx = (page - 1) * itemsPerPage + localIdx;
          return (
            <Card
              key={q.id}
              variant="outlined"
              sx={{
                p: 0,
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  px: 3,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 800 }}>
                      {deckFile.questions.length - globalIdx}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight="700" letterSpacing="0.5px">
                    QUESTÃO
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemove(globalIdx)}
                  sx={{ '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Tópico Técnico"
                      fullWidth
                      variant="filled"
                      placeholder="Ex: Teorema CAP, AWS S3, Algoritmos..."
                      value={q.topic}
                      onChange={(e) => handleUpdate(globalIdx, 'topic', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Enunciado"
                      fullWidth
                      multiline
                      rows={2}
                      variant="filled"
                      value={q.question}
                      onChange={(e) => handleUpdate(globalIdx, 'question', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        ALTERNATIVAS
                      </Typography>
                    </Divider>
                  </Grid>

                  {q.choices.map((choice, cIdx) => (
                    <Grid item xs={12} sm={6} key={cIdx}>
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          label={`Opção ${String.fromCharCode(65 + cIdx)}`}
                          fullWidth
                          variant="standard"
                          value={choice}
                          sx={{
                            '& .MuiInput-root': { pr: 4 },
                            bgcolor:
                              q.answerIndex === cIdx ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                            p: 1,
                            borderRadius: '4px',
                          }}
                          onChange={(e) => handleUpdateChoice(globalIdx, cIdx, e.target.value)}
                        />
                        {q.answerIndex === cIdx && (
                          <CheckCircleOutlineIcon
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: 16,
                              color: '#10B981',
                              fontSize: '1.2rem',
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="filled" size="small">
                      <InputLabel>Resposta Correta</InputLabel>
                      <Select
                        value={q.answerIndex}
                        sx={{ borderRadius: '8px' }}
                        onChange={(e) => handleUpdate(globalIdx, 'answerIndex', e.target.value as number)}
                      >
                        <MenuItem value={0}>Alternativa A</MenuItem>
                        <MenuItem value={1}>Alternativa B</MenuItem>
                        <MenuItem value={2}>Alternativa C</MenuItem>
                        <MenuItem value={3}>Alternativa D</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Explicação Técnica"
                      fullWidth
                      variant="filled"
                      multiline
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => handleUpdate(globalIdx, 'explanation', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Card>
          );
        })}
      </Stack>

      {totalPages > 1 && (
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {deckFile.questions.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 12,
            bgcolor: 'action.hover',
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Este deck está vazio
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddQuestion}>
            Adicionar primeira questão
          </Button>
        </Box>
      )}

      {deckFile.questions.length > 3 && (
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              px: 6,
              py: 2,
              borderRadius: '14px',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)',
            }}
          >
            Salvar Todas as Questões
          </Button>
        </Box>
      )}
    </Box>
  );
}
