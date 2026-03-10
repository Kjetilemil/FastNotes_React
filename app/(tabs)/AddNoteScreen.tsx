
import { NotesContext } from "@/context/NotesContext";
import { supabase } from '@/lib/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

function Camera({ onPhotoTaken }: { onPhotoTaken: (uri: string) => void }) {
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync({
        quality: 0.5 
      });
      onPhotoTaken(data.uri);
    }
  };

  return (
    <CameraView style={{ flex: 1 }} ref={cameraRef}>
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 }}>
        <Button title="Take Picture" onPress={takePicture} />
      </View>
    </CameraView>
  );
}
// Registrer Expo push token når AddNoteScreen rendres
useEffect(() => {
  async function registerPushToken() {
    const expoPushToken = await Notifications.getExpoPushTokenAsync();
    const user = (await supabase.auth.getUser()).data.user;
    if (expoPushToken && user?.id) {
      await supabase.from('notifications').insert([
        { user_id: user.id, expo_push_token: expoPushToken }
      ]);
    }
  }
  registerPushToken();
}, []);


export default function AddNoteScreen() {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const router = useRouter();
    const notesContext = useContext(NotesContext);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [mediaPermission, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
    const [image, setImage] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    // Funksjon for å laste opp bilde til Supabase Storage
    const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
      try {
        // Hent brukerdata for å lage unikt filnavn
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return null;

        // Generer unikt filnavn
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}_${timestamp}_${random}.${extension}`;

        // Bruk fetch for å lese filen som ArrayBuffer
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        // Riktig MIME type (jpg → jpeg)
        const mimeType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;

        // Last opp til Supabase Storage
        const { data, error } = await supabase.storage
          .from('note images')
          .upload(fileName, arrayBuffer, {
            contentType: mimeType,
          });

        if (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
          return null;
        }

        // Hent public URL
        const { data: { publicUrl } } = supabase.storage
          .from('note images')
          .getPublicUrl(fileName);

        return publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', 'Failed to upload image');
        return null;
      }
    };

    const imageValidation = async (uri: string) => {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        Alert.alert("Error", "File not found");
        return false;
      }
      
      // Sjekk størrelse: 15MB = 15 * 1024 * 1024 bytes
      if (fileInfo.size && fileInfo.size > 15 * 1024 * 1024) {
        Alert.alert("Error", "File too large. Max 15MB");
        return false;
      }
      
      // Sjekk format basert på filendelse
      const extension = uri.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      if (!extension || !validExtensions.includes(extension)) {
        Alert.alert("Error", "Invalid format. Only JPG, PNG, WebP");
        return false;
      }
      
      return true;
    };

    // Be om kamera-tillatelse når komponenten lastes
    const takePicture = () => {
      setShowCamera(true);
    };

    // Håndter resultatet av kamera-tillatelse
    const handlePhotoTaken = async (uri: string) => {
      if (await imageValidation(uri)) {
        setImage(uri);
        setShowCamera(false);
      }
    };

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });

      if (!result.canceled && await imageValidation(result.assets[0].uri)) {
        setImage(result.assets[0].uri);
      }
    };

    // Hvis vi ikke har tillatelse, be om det
    if (!cameraPermission || !mediaPermission) {
      return <View />
    }
    
    // Hvis tillatelse er nektet, vis en melding og en knapp for å be om tillatelse
    if (!cameraPermission.granted || !mediaPermission.granted) { 
      return (
        <View style={styles.container}>
          <Text style={styles.message}>We need your permission to access camera and photos</Text>
          {!cameraPermission.granted && (
            <Button onPress={requestCameraPermission} title="grant camera permission" />
          )}
          {!mediaPermission.granted && (
            <Button onPress={requestMediaPermission} title="grant media library permission" />
          )}
        </View>
      );
    }

  return (
    <View style={{ flex: 1 }}>
      {showCamera ? (
        <Camera onPhotoTaken={handlePhotoTaken} />
      ) : (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.headerStyle}>Add a New Note</Text>
            
            <View style={styles.cameraButtonStyle}>
              <Button title="Take Photo" onPress={takePicture} />
              <Button title="Choose from Gallery" onPress={pickImage} />
            </View>

            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}

            <View style={styles.inputBackgroundStyle}>
              <TextInput
                style={styles.notetitlestyle}
                placeholder="Title:"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.notecontentstyle}
                placeholder="Content:"
                value={content}
                onChangeText={setContent}
                multiline
              />
            </View>
            
            <StatusBar style="auto" />
            
            {saving && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Saving...</Text>
              </View>
            )}

            <View style={styles.buttonPlacementStyle}>
              <Button title="Save Note" onPress={async () => {
                if (!title.trim() || !content.trim()) {
                  Alert.alert("Error", "Both title and content are required.");
                  return;
                }

                setSaving(true);

                // Last opp bilde hvis det finnes
                let imageUrl: string | undefined = undefined;
                if (image) {
                  imageUrl = await uploadImageToSupabase(image) || undefined;
                }

                // Lagre notat med image URL
                await notesContext?.addNote(title.trim(), content.trim(), imageUrl);
                setSaving(false);
                Alert.alert("Saved", "Note saved.");
                router.push("/");
              }} disabled={saving} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
    marginTop: 100,
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
    height: 200,  
  },
  notecontentstyle: {
    fontSize: 20,
    marginTop: 10,
  },
  notetitlestyle: {
    fontSize: 20,
    marginTop: 10,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  cameraButtonStyle: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: 300,
  },
  imagePreview: {
    width: 300,
    height: 200,
    marginBottom: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});