"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedKeywordsContextType {
  selectedKeywords: string[];
  setSelectedKeywords: React.Dispatch<React.SetStateAction<string[]>>;
}

const SelectedKeywordsContext = createContext<SelectedKeywordsContextType | undefined>(undefined);

export const SelectedKeywordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  return (
    <SelectedKeywordsContext.Provider value={{ selectedKeywords, setSelectedKeywords }}>
      {children}
    </SelectedKeywordsContext.Provider>
  );
};

export const useSelectedKeywords = (): SelectedKeywordsContextType => {
  const context = useContext(SelectedKeywordsContext);
  if (context === undefined) {
    throw new Error('useSelectedKeywords must be used within a SelectedKeywordsProvider');
  }
  return context;
};
