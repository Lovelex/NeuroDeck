import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  deck: {
    list: () => ipcRenderer.invoke('deck:list'),
    create: (name: string, description: string) =>
      ipcRenderer.invoke('deck:create', { name, description }),
    update: (deck: any) => ipcRenderer.invoke('deck:update', deck),
    delete: (deckId: string) => ipcRenderer.invoke('deck:delete', deckId),
    import: () => ipcRenderer.invoke('deck:import'),
    importText: (text: string) => ipcRenderer.invoke('deck:import-text', text),
    exportAll: () => ipcRenderer.invoke('deck:export-all'),
    toggleActive: (deckId: string, isActive: boolean) =>
      ipcRenderer.invoke('deck:toggleActive', { deckId, isActive }),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings: any) => ipcRenderer.invoke('settings:update', settings),
  },
  onQuestionTriggered: (callback: (question: any, deckId: string) => void) => {
    ipcRenderer.on('trigger-question', (_, { question, deckId }) => callback(question, deckId));
  },
  question: {
    answer: (deckId: string, questionId: string, isCorrect: boolean) =>
      ipcRenderer.invoke('question:answer', { deckId, questionId, isCorrect }),
  },
  debug: {
    triggerQuestion: () => ipcRenderer.invoke('debug:trigger-question'),
  },
});
