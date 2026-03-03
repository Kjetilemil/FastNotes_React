import { NotesContext } from "@/context/NotesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";


export default function ViewNoteScreen() {
  const { id } = useLocalSearchParams(); // note id from route
  const notesContext = useContext(NotesContext);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");


  // finn notatet og fyll felt
  useEffect(() => {
    if (!notesContext || typeof id !== "string") return;
    const note = notesContext.notes.find((n) => n.id === id);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [id, notesContext?.notes]);


  if (!notesContext || typeof id !== "string") {
    return (
      <View style={styles.container}>
        <Text style={styles.headerStyle}>Note not found</Text>
      </View>
    );
  }


  const note = notesContext.notes.find((n) => n.id === id);
  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerStyle}>Note not found</Text>
      </View>
    );
  }


  const save = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Both title and content are required.");
      return;
    }
    await notesContext.updateNote(note.id, title.trim(), content.trim()); // Supabase update
      Alert.alert("Saved", "Note updated.");
    router.push("/");
  };


  const deleteNote = () => {
    Alert.alert("Delete note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await notesContext.deleteNote(note.id); // Supabase delete
            Alert.alert("Deleted", "Note deleted.");
          router.push("/");
        },
      },
    ]);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.headerStyle}>View Selected Note</Text>
      <View style={styles.inputBackgroundStyle}>
        <TextInput
          style={styles.notetitlestyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
        <TextInput
          style={styles.notecontentstyle}
          value={content}
          onChangeText={setContent}
          placeholder="Content"
          multiline
        />
      </View>
      <View style={styles.actions}>
        <Button title="Save" onPress={save} />
        <Button title="Delete" color="red" onPress={deleteNote} />
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
  notetitlestyle: {
    fontSize: 20,
    marginTop: 10,
  },
  inputBackgroundStyle: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 15,
    width: 300,
    marginTop: 20,
    height: 300,
  },
  notecontentstyle: {
    fontSize: 20,
    marginTop: 10,
    flex: 1,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
});