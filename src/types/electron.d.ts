export interface ElectronAPI {
  deck: {
    list: () => Promise<any[]>;
    create: (name: string, description: string) => Promise<any>;
    update: (deck: any) => Promise<any>;
    delete: (deckId: string) => Promise<boolean>;
    import: () => Promise<boolean>;
    toggleActive: (deckId: string, isActive: boolean) => Promise<boolean>;
  };
  settings: {
    get: () => Promise<any>;
    update: (settings: any) => Promise<any>;
  };
  onQuestionTriggered: (callback: (question: any, deckId: string) => void) => void;
  question: {
    answer: (deckId: string, questionId: string, isCorrect: boolean) => Promise<boolean>;
  };
  debug: {
    triggerQuestion: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
