/// <reference types="vite/client" />

interface Window {
  api: {
    saveEntry: (entry: any) => Promise<{ id: number }>;
    getEntries: () => Promise<any[]>;
  };
}
