import { supabase } from '@/lib/supabase';
import React, { createContext, ReactNode, useEffect, useState } from 'react';


// type for a row in supabase
export type Note = {
  id: string; // identifier for the note
  userid: string; // identifier for the user
  title: string; // title of the note
  content: string; // content of the note
  updatedat: string; // timestamp of the last update
  image_url?: string; // optional image URL
};


type NotesContextType = {
  notes: Note[]; // array of notes
  getNote: () => Promise<void>; // function to fetch notes from the database
  addNote: (title: string, content: string, imageUrl?: string) => Promise<void>; // function to add a new note to the database
  updateNote: (id: string, title: string, content: string) => Promise<void>; // function to update an existing note in the database
  deleteNote: (id: string) => Promise<void>; // function to delete a note from the database
};


// create the context with an undefined default value
export const NotesContext = createContext<NotesContextType | undefined>(undefined);


// provider component to wrap the app and provide the notes context
export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);


  // function to fetch notes from the database and update the state
  const getNote = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // console.log("Ikke logget inn: session mangler i getNote");
      return;
    }
    const { data: notesData, error } = await supabase
      .from("notes")
      .select("*")
      .order("updatedat", { ascending: false })
      .limit(5);
    if (error) {
      console.error("Error fetching notes:", error);
      // console.log("Supabase error details:", error);
      return;
    }
    setNotes(notesData as Note[]);
  }


    // function to add a new note to the database and refresh the notes list
    const addNote = async (title: string, content: string, imageUrl?: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userid = userData?.user?.id;
      if (!userid) {
        alert("You are not logged in or your email is not verified. Note will not be saved.");
        return;
      }
      const { error } = await supabase.from('notes').insert({ title, content, userid, updatedat: new Date().toISOString(), image_url: imageUrl });
      if (error) {
        alert("Error saving note: " + error.message);
        return;
      }
    await getNote();
  };
  

    // function to update an existing note in the database and refresh the notes list
    const updateNote = async (id: string, title: string, content: string) => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
    await supabase
      .from('notes')
      .update({ title, content, updatedat: new Date().toISOString() })
      .eq('id', id);
    await getNote();
  };


  // function to delete a note from the database and refresh the notes list
  const deleteNote = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('notes').delete().eq('id', id);
    await getNote();
  };


  // fetch notes when the component mounts
  useEffect(() => {
    getNote();
  }, []);

  
  // provide the notes and functions to the context consumers
  return (
    <NotesContext.Provider value={{ notes, getNote, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};