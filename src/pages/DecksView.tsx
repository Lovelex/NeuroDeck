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
  Alert,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import TerminalIcon from '@mui/icons-material/Terminal';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckFile | null>(null);
  const [deckForm, setDeckForm] = useState({
    name: '',
    description: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [terminalText, setTerminalText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = progress?.preferences.itemsPerPageDecks || 10;

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

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTags]);

  const filteredDecks = decks.filter((d) => {
    const matchesSearch =
      d.deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((t) => d.deck.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  const paginatedDecks = filteredDecks.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredDecks.length / itemsPerPage);

  const handleToggle = async (deckId: string, isActive: boolean) => {
    if (!isElectron) return;
    await window.electron.deck.toggleActive(deckId, isActive);
    loadData();
  };

  const handleSaveDeck = async () => {
    if (!deckForm.name.trim()) return;

    if (editingDeck) {
      // Update existing
      const updatedDeck: DeckFile = {
        ...editingDeck,
        deck: {
          ...editingDeck.deck,
          name: deckForm.name,
          description: deckForm.description,
          tags: deckForm.tags,
          updatedAt: new Date().toISOString(),
        },
      };
      await window.electron.deck.update(updatedDeck);
    } else {
      // Create new
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
    }

    setModalOpen(false);
    setEditingDeck(null);
    setDeckForm({ name: '', description: '', tags: [] });
    loadData();
  };

  const handleOpenEdit = (deck: DeckFile) => {
    setEditingDeck(deck);
    setDeckForm({
      name: deck.deck.name,
      description: deck.deck.description,
      tags: deck.deck.tags,
    });
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingDeck(null);
    setDeckForm({ name: '', description: '', tags: [] });
    setModalOpen(true);
  };

  const handleFileImport = async () => {
    const result = await window.electron.deck.import();
    if (result.success) {
      loadData();
    } else if (result.error) {
      setImportError(result.error);
    }
  };

  const handleTerminalImport = async () => {
    if (!terminalText.trim()) return;
    setImportError(null);
    const result = await window.electron.deck.importText(terminalText);
    if (result.success) {
      setTerminalOpen(false);
      setTerminalText('');
      loadData();
    } else {
      setImportError(result.error || 'Erro desconhecido');
    }
  };

  const handleExportAll = async () => {
    const result = await window.electron.deck.exportAll();
    if (!result.success && !result.canceled) {
      setImportError(result.error || 'Erro desconhecido ao exportar');
    }
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
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 3, md: 4 }
    }}>
      {/* SIDEBAR: TAGS */}
      <Box sx={{
        width: { xs: '100%', md: 180 },
        flexShrink: 0,
        borderBottom: { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
        pb: { xs: 2, md: 0 }
      }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ mb: 2, display: 'block', fontWeight: 'bold', letterSpacing: '1px' }}
        >
          FILTRAR POR TAGS
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          overflowX: { xs: 'auto', md: 'visible' },
          pb: { xs: 1, md: 0 },
          gap: 1,
          alignItems: 'flex-start',
          '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for cleaner look
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
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
                flexShrink: 0,
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
        </Box>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2
        }}>
          <Typography variant="h4" fontWeight="800" letterSpacing="-1.5px">
            Seus Decks
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              flexWrap: 'wrap',
              rowGap: 1
            }}
          >
            <Tooltip title="Importar via Terminal (Texto)">
              <IconButton
                onClick={() => {
                  setImportError(null);
                  setTerminalOpen(true);
                }}
                sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}
              >
                <TerminalIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar Tudo (Backup)">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportAll}
              >
                Exportar
              </Button>
            </Tooltip>
            <Tooltip title="Importar arquivo JSON">
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                fullWidth={false}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
                onClick={handleFileImport}
              >
                Arquivo
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth={false}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
              onClick={handleOpenCreate}
            >
              Novo
            </Button>
          </Stack>
        </Box>

        {/* TOOLBAR */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 4,
            gap: 2,
          }}
        >
          <TextField
            placeholder="Pesquisar decks..."
            size="small"
            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 400 } }}
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        </Box>

        {filteredDecks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
            <Typography variant="body2">Nenhum deck encontrado.</Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {paginatedDecks.map((deck) => (
              <Grid item xs={12} md={6} lg={4} key={deck.deck.id}>
                <DeckCard
                  deck={deck.deck}
                  questionCount={deck.questions.length}
                  isActive={progress?.decks[deck.deck.id]?.isActive ?? false}
                  onToggle={(val) => handleToggle(deck.deck.id, val)}
                  onEditQuestions={() => onManageQuestions(deck.deck.id)}
                  onEditMetadata={() => handleOpenEdit(deck)}
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
            {paginatedDecks.map((deck) => (
              <Paper
                key={deck.deck.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 2, sm: 3 },
                  bgcolor: 'background.paper',
                  backgroundImage: 'none',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' },
                  transition: 'border-color 0.2s',
                }}
              >
                <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="600" noWrap>
                    {deck.deck.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block' }}
                  >
                    {deck.deck.description || 'Sem descrição.'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
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

                <Box sx={{ minWidth: 60, textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {deck.questions.length} Qs
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Editar Nome/Tags">
                      <IconButton size="small" onClick={() => handleOpenEdit(deck)}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {progress?.decks[deck.deck.id]?.isActive ? 'Ativo' : 'Inativo'}
                    </ToggleButton>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {totalPages > 1 && (
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
              size="medium"
            />
          </Box>
        )}
      </Box>

      {/* NEW DECK MODAL */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingDeck ? 'Editar Deck' : 'Criar Novo Deck'}
        </DialogTitle>
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
          <Button variant="contained" onClick={handleSaveDeck} disabled={!deckForm.name.trim()}>
            {editingDeck ? 'Salvar Alterações' : 'Criar Deck'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TERMINAL IMPORT MODAL */}
      <Dialog
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#111827', color: '#10B981', fontFamily: 'monospace' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #1F2937', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalIcon sx={{ color: '#10B981' }} />
          TERMINAL DE IMPORTAÇÃO
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px border', borderColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Typography variant="subtitle2" sx={{ color: '#10B981', fontWeight: 600, mb: 1 }}>
              💡 Formatos Aceitos:
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 0.5 }}>
              • <strong>Deck Único:</strong> <code>{"{ \"deck\": { ... }, \"questions\": [...] }"}</code>
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
              • <strong>Vários Decks:</strong> <code>{"[ { \"deck\": ... }, { \"deck\": ... } ]"}</code>
            </Typography>
          </Box>

          {importError && (
            <Alert
              severity="error"
              variant="filled"
              sx={{
                mb: 2,
                bgcolor: '#991B1B',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {importError}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={15}
            placeholder='{ "deck": { ... }, "questions": [...] }'
            value={terminalText}
            onChange={(e) => setTerminalText(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#D1D5DB',
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.85rem'
              }
            }}
            sx={{
              bgcolor: '#030712',
              p: 2,
              borderRadius: '8px',
              border: '1px solid #374151'
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #1F2937' }}>
          <Button onClick={() => setTerminalOpen(false)} sx={{ color: '#9CA3AF' }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleTerminalImport}
            disabled={!terminalText.trim()}
            sx={{
              bgcolor: '#10B981',
              color: '#064E3B',
              fontWeight: 800,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            EXECUTAR IMPORTAÇÃO
          </Button>
        </DialogActions>
      </Dialog>

      {/* GLOBAL ERROR ALERT */}
      {importError && !terminalOpen && (
        <Dialog open={true} onClose={() => setImportError(null)}>
          <DialogTitle sx={{ color: 'error.main' }}>Erro na Importação de Arquivo</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {importError}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportError(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
