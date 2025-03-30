import { createContext, useContext } from 'react';

export const createJournalContext = () => {
  const JournalContext = createContext(null);
  const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) throw new Error("useJournal must be used inside provider");
    return context;
  };
  return { JournalContext, useJournal };
};
