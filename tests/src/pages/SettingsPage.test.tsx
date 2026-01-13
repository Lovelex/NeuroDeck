import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsPage } from '../../../src/pages/SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProgress = {
    scheduler: {
      isPaused: false,
      questionsPerDay: 10,
      minIntervalMinutes: 30,
      nextFireAt: new Date().toISOString(),
    },
  };

  it('loads and displays settings', async () => {
    ((window as any).electron.settings.get as any).mockResolvedValue(mockProgress);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Intervalo Mínimo/i)).toHaveValue(30);
      expect(screen.getByLabelText(/Limite de Questões/i)).toHaveValue(10);
    });
  });

  it('calls update when save button is clicked', async () => {
    ((window as any).electron.settings.get as any).mockResolvedValue(mockProgress);
    ((window as any).electron.settings.update as any).mockResolvedValue({});

    render(<SettingsPage />);

    await waitFor(() => screen.getByLabelText(/Intervalo Mínimo/i));

    const saveButton = screen.getByText(/Salvar/i);
    fireEvent.click(saveButton);

    expect((window as any).electron.settings.update).toHaveBeenCalled();
  });
});
