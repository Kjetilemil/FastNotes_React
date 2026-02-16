import { NotesContext } from "@/context/NotesContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ViewNoteScreen() {
    const {index} = useLocalSearchParams();
    const notesContext = useContext(NotesContext);
    const notesArray = notesContext ? notesContext.notes : [];
    const router = useRouter();

    const noteIndex = typeof index === 'string' ? parseInt(index, 10) : NaN;
    const note = notesArray[noteIndex];
    
  return (
    <View style={styles.container}>
      <Text style={styles.headerStyle}>View Selected Note</Text>
      <View style={styles.inputBackgroundStyle}>
        <View></View>
      <Text style={styles.notetitlestyle}>{note?.title}</Text>
      <Text style={styles.notecontentstyle}>{note?.content}</Text>
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
  },
}); 
