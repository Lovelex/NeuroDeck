import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Switch,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { ReactNode, useEffect, useState } from 'react';
import { UserProgress } from '../types';

const SIDEBAR_WIDTH = 220;
const HEADER_HEIGHT = 64;

interface LayoutProps {
  children: ReactNode;
  currentView: 'decks' | 'settings' | 'history';
  onNavigate: (view: 'decks' | 'settings' | 'history') => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const loadProgress = async () => {
    if (window.electron) {
      const data = await window.electron.settings.get();
      setProgress(data);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleToggleSystem = async () => {
    if (!progress || !window.electron) return;
    const newStatus = !progress.scheduler.isPaused;
    await window.electron.settings.update({ isPaused: newStatus });
    loadProgress();
  };

  const isSystemOn = progress ? !progress.scheduler.isPaused : false;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>
              N
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              fontSize: '1.1rem',
            }}
          >
            NeuroDeck
          </Typography>
        </Box>

        <List sx={{ px: 1.5, flexGrow: 1 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={currentView === 'decks'}
              onClick={() => onNavigate('decks')}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DashboardIcon
                  fontSize="small"
                  color={currentView === 'decks' ? 'primary' : 'inherit'}
                />
              </ListItemIcon>
              <ListItemText
                primary="Decks"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: currentView === 'decks' ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={currentView === 'history'}
              onClick={() => onNavigate('history')}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HistoryIcon
                  fontSize="small"
                  color={currentView === 'history' ? 'primary' : 'inherit'}
                />
              </ListItemIcon>
              <ListItemText
                primary="Histórico"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: currentView === 'history' ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={currentView === 'settings'}
              onClick={() => onNavigate('settings')}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon
                  fontSize="small"
                  color={currentView === 'settings' ? 'primary' : 'inherit'}
                />
              </ListItemIcon>
              <ListItemText
                primary="Configurações"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: currentView === 'settings' ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ mx: 2, mb: 2 }} />
        <Box sx={{ p: 2, mb: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, ml: 1, mb: 1, display: 'block' }}
          >
            ESTADO
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: isSystemOn ? 'rgba(59, 130, 246, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: '1px solid',
              borderColor: isSystemOn ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight="600" color={isSystemOn ? 'primary' : 'error'}>
                {isSystemOn ? 'ATIVO' : 'PAUSADO'}
              </Typography>
              <Switch
                size="small"
                checked={isSystemOn}
                onChange={handleToggleSystem}
                color="primary"
              />
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Main Wrapper */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Header */}
        <Box
          sx={{
            height: HEADER_HEIGHT,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            px: 4,
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {currentView.toUpperCase()}
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isSystemOn ? '#10B981' : '#EF4444',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                STATUS DO AGENDADOR
              </Typography>
            </Stack>
            <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
            <IconButton
              size="small"
              onClick={handleToggleSystem}
              color={isSystemOn ? 'primary' : 'default'}
            >
              <PowerSettingsNewIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Content Area */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
