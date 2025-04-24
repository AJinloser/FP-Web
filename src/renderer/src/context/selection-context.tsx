import React, { createContext, useContext, useState } from 'react';

interface SelectionContextType {
  options: string[];
  currentSelection: string | null;
  setCurrentSelection: (selection: string) => void;
  setOptions: (options: string[]) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);

  const value = {
    options,
    currentSelection,
    setCurrentSelection,
    setOptions,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
} 