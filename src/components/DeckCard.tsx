import {
  Card,
  CardContent,
  Typography,
  Switch,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import EditIcon from '@mui/icons-material/Edit';
import { DeckMetadata } from '../types';

interface DeckCardProps {
  deck: DeckMetadata;
  questionCount: number;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  onEditQuestions: () => void;
  onEditMetadata: () => void;
  onDelete: () => void;
}

export function DeckCard({
  deck,
  questionCount,
  isActive,
  onToggle,
  onEditQuestions,
  onEditMetadata,
  onDelete,
}: DeckCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { borderColor: 'primary.main' },
        transition: 'border-color 0.2s',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.2px' }}
          >
            {deck.name}
          </Typography>
          <Switch
            checked={isActive}
            onChange={(e) => onToggle(e.target.checked)}
            color="primary"
            size="small"
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, minHeight: '3em', opacity: 0.8 }}
        >
          {deck.description || 'Sem descrição.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {deck.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: '20px', borderRadius: '4px' }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
            pt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {questionCount} questões
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar Nome/Tags">
              <IconButton
                size="small"
                onClick={onEditMetadata}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Gerenciar Questões">
              <IconButton
                size="small"
                onClick={onEditQuestions}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <QuestionAnswerIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir Deck">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
