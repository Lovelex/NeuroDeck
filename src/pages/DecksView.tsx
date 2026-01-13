import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeckCard } from '../components/DeckCard';
import { DeckFile, UserProgress } from '../types';

interface DecksViewProps {
  onManageQuestions: (deckId: string) => void;
}

export function DecksView({ onManageQuestions }: DecksViewProps) {
  const [decks, setDecks] = useState<DeckFile[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deckForm, setDeckForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const isElectron = !!window.electron;

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedDecks, fetchedProgress] = await Promise.all([
        window.electron.deck.list(),
        window.electron.settings.get(),
      ]);
      setDecks(fetchedDecks || []);
      setProgress(fetchedProgress);
    } catch (err) {
      console.error('Falha ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const allTags = Array.from(new Set(decks.flatMap((d) => d.deck.tags))).sort();

  const filteredDecks = decks.filter((d) => {
    const matchesSearch =
      d.deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((t) => d.deck.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  const handleToggle = async (deckId: string, isActive: boolean) => {
    if (!isElectron) return;
    await window.electron.deck.toggleActive(deckId, isActive);
    loadData();
  };

  const handleCreateDeck = async () => {
    if (!deckForm.name.trim()) return;
    const newId = Math.random().toString(36).substring(2, 11);
    const newDeckFile: DeckFile = {
      deck: {
        id: newId,
        name: deckForm.name,
        description: deckForm.description,
        tags: deckForm.tags,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      questions: [],
    };
    await window.electron.deck.update(newDeckFile);
    setModalOpen(false);
    setDeckForm({ name: '', description: '', tags: [] });
    loadData();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      {/* SIDEBAR: TAGS */}
      <Box sx={{ width: 180, flexShrink: 0 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ mb: 2, display: 'block', fontWeight: 'bold', letterSpacing: '1px' }}
        >
          TAGS
        </Typography>
        <Stack spacing={1} alignItems="flex-start">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => toggleTag(tag)}
              size="small"
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
              sx={{
                borderRadius: '4px',
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: selectedTags.includes(tag) ? 'primary.main' : 'divider',
                bgcolor: selectedTags.includes(tag) ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: selectedTags.includes(tag) ? 'primary.dark' : 'action.hover',
                },
              }}
            />
          ))}
          {allTags.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Nenhuma tag cadastrada.
            </Typography>
          )}
        </Stack>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="600" letterSpacing="-1px">
            Decks
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Importar arquivo JSON compatível">
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => window.electron.deck.import().then(loadData)}
              >
                Importar
              </Button>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              Novo Deck
            </Button>
          </Stack>
        </Box>

        {/* TOOLBAR */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            gap: 2,
          }}
        >
          <TextField
            placeholder="Pesquisar..."
            size="small"
            sx={{ flexGrow: 1, maxWidth: 300 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Paper
            variant="outlined"
            sx={{
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: '8px',
              borderColor: 'divider',
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': { border: 'none', borderRadius: '4px', p: 1 },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Box>

        {filteredDecks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
            <Typography variant="body2">Nenhum deck encontrado.</Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredDecks.map((deck) => (
              <Grid item xs={12} sm={6} key={deck.deck.id}>
                <DeckCard
                  deck={deck.deck}
                  questionCount={deck.questions.length}
                  isActive={progress?.decks[deck.deck.id]?.isActive ?? false}
                  onToggle={(val) => handleToggle(deck.deck.id, val)}
                  onEdit={() => onManageQuestions(deck.deck.id)}
                  onDelete={() =>
                    window.confirm('Deseja excluir este deck?') &&
                    window.electron.deck.delete(deck.deck.id).then(loadData)
                  }
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={1.5}>
            {filteredDecks.map((deck) => (
              <Paper
                key={deck.deck.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' },
                  transition: 'border-color 0.2s',
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="600">
                    {deck.deck.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block', maxWidth: 300 }}
                  >
                    {deck.deck.description || 'Sem descrição.'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  {deck.deck.tags.slice(0, 2).map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  ))}
                </Stack>

                <Box sx={{ width: 80, textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    {deck.questions.length} Qs
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Gerenciar Questões">
                    <IconButton size="small" onClick={() => onManageQuestions(deck.deck.id)}>
                      <QuestionAnswerIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        window.confirm('Excluir deck?') &&
                        window.electron.deck.delete(deck.deck.id).then(loadData)
                      }
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Box sx={{ ml: 1 }}>
                  <ToggleButton
                    value="check"
                    selected={progress?.decks[deck.deck.id]?.isActive}
                    onChange={() =>
                      handleToggle(deck.deck.id, !progress?.decks[deck.deck.id]?.isActive)
                    }
                    size="small"
                    sx={{
                      borderRadius: 10,
                      px: 2,
                      height: 28,
                      textTransform: 'none',
                      fontSize: '0.7rem',
                    }}
                  >
                    {progress?.decks[deck.deck.id]?.isActive ? 'Ativo' : 'Inativo'}
                  </ToggleButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* NEW DECK MODAL */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Criar Novo Deck</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nome do Deck"
              fullWidth
              variant="filled"
              value={deckForm.name}
              onChange={(e) => setDeckForm({ ...deckForm, name: e.target.value })}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={2}
              variant="filled"
              value={deckForm.description}
              onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Tags
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                size="small"
                placeholder="Pressione Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    if (!deckForm.tags.includes(tagInput.trim())) {
                      setDeckForm({ ...deckForm, tags: [...deckForm.tags, tagInput.trim()] });
                    }
                    setTagInput('');
                  }
                }}
              />
              <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {deckForm.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() =>
                      setDeckForm({ ...deckForm, tags: deckForm.tags.filter((t) => t !== tag) })
                    }
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateDeck} disabled={!deckForm.name.trim()}>
            Criar Deck
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
