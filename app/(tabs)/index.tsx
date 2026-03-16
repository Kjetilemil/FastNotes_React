import { Note, NotesContext } from "@/context/NotesContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from '@react-navigation/native';
import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Button, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


type NoteProps = {
  note: Note;
};

const NoteItem = ({ note }: NoteProps) => {
  return (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/ViewNoteScreen?id=${note.id}`)} style={styles.noteItem}>
      {note.image_url && (
        <Image source={{ uri: note.image_url }} style={styles.noteImage} />
      )}
      <Text style={styles.noteStyle}>{note.title}</Text>
    </TouchableOpacity>
  );
};


export default function App() {
  const router = useRouter();
  const notesContext = useContext(NotesContext);

  useFocusEffect(
    React.useCallback(() => {
      notesContext?.getNote();
    }, [notesContext])
  );

  if (!notesContext) return null;

  const { notes } = notesContext;

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/(tabs)/authenticate");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerStyle}>Jobb Notater</Text>
        <View>
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </View>
        <StatusBar style="auto" />
        <View style={styles.buttonPlacementStyle}>
          <Button title="Add Note" onPress={() => router.push("/AddNoteScreen")} />
        </View>
        <View style={styles.logoutPlacementStyle}>
          <Button title="Log Out" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 50,
  },
  headerStyle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 200,
  },
  noteItem: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    width: 300,
    borderRadius: 15,
    marginTop: 10,
  },
  noteImage: {
    width: 280,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  noteStyle: {
    fontSize: 20,
    textAlign: "center",
  },
  buttonPlacementStyle: {
    marginTop: 30,
  },
  logoutPlacementStyle: {
    marginTop: 10,
    marginBottom: 20,
  },
});