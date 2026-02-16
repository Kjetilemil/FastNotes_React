import React, { createContext, ReactNode, useState } from 'react';

type Note = {
  title: string;
  content: string;
};

type NotesContextType = {
  notes: Note[];
  addNote: (note: Note) => void;
};

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);

    const addNote = (note: Note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
    };

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  );
};