import { NotesContext } from "@/context/NotesContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Button, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddNoteScreen() {
    const [title, setTitle] = React.useState<string>("");
    const [content, setContent] = React.useState<string>("");
    const router = useRouter();
    const notesContext = useContext(NotesContext);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >   
        <Text style={styles.headerStyle}>Add a New Note</Text>
        <View style={styles.inputBackgroundStyle}>
        <TextInput style={styles.notetitlestyle}
        placeholder="Title:"
        value ={title}
        onChangeText={setTitle}
        />
        <TextInput style={styles.notecontentstyle}
        placeholder="Content:"
        value={content}
        onChangeText={setContent}
        />
        </View>
        <StatusBar style="auto" />
        <View style={styles.buttonPlacementStyle}>
          <Button title="Save Note" onPress={() => {
            if (notesContext) {
              notesContext.addNote({title, content});
            }
            router.push("/");
          }} />
        </View>
    </KeyboardAvoidingView>
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
  buttonPlacementStyle: {
    marginTop: 50,
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
  },
  notetitlestyle: {
    fontSize: 20,
    marginTop: 10,
  },
});