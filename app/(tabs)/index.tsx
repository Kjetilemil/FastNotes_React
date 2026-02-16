import { NotesContext } from "@/context/NotesContext";
import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Note = {
  title: string;
  content: string;
};


type NoteProps = {
  note: Note;
  index: number;
};

const NoteItem = (props: NoteProps) => {
  return (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/ViewNoteScreen?index=${props.index}`)}>
      <Text style={styles.noteStyle}>{props.note.title}</Text>
    </TouchableOpacity>
  );
};



export default function App() {
  const router = useRouter();
  const notesContext = useContext(NotesContext);
  const notesArray = notesContext ? notesContext.notes : [];
  return (
    <View style={styles.container}>
      <Text style={styles.headerStyle}>FastNotes</Text>
      <View>
      {notesArray.map((note, index) => (
        <NoteItem key={index} note={note} index={index} />
      ))}
      </View>
      <StatusBar style="auto" />
      <View style={styles.buttonPlacementStyle}>
        <Button title="Add Note" onPress={() => router.push("/AddNoteScreen")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerStyle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 200,
  },
  noteStyle: {
    fontSize: 20,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    width: 300,
    textAlign: "center",
    borderRadius: 15,
  },
  buttonPlacementStyle: {
    position: "absolute",
    marginTop: 600,
  },
});