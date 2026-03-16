
import { NotesContext } from "@/context/NotesContext";
import { supabase } from '@/lib/supabase';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useRef, useState } from "react";
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




export default function AddNoteScreen() {
  const [title, setTitle] = useState<string>("");
  const isFocused = useIsFocused();
  const [content, setContent] = useState<string>("");
  const router = useRouter();
  const notesContext = useContext(NotesContext);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  // function to upload image to supabase storage and return the public URL
  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      // get user ID for unique file naming
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return null;

      // Generate unique file name
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}_${timestamp}_${random}.${extension}`;

      // Use fetch to read the file as an ArrayBuffer
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      // Correct MIME type (jpg → jpeg)
      const mimeType = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;

      // Upload to Supabase Storage
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

      // Get public URL
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
    // check size 15MB 
    if (fileInfo.size && fileInfo.size > 15 * 1024 * 1024) {
      Alert.alert("Error", "File too large. Max 15MB");
      return false;
    }
    // check format based on file extension
    const extension = uri.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!extension || !validExtensions.includes(extension)) {
      Alert.alert("Error", "Invalid format. Only JPG, PNG, WebP");
      return false;
    }
    return true;
  };

  // for allowing user to take picture with camera
  const takePicture = () => {
    setShowCamera(true);
  };

  // Handle the result of camera permission
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

  // If we don't have permission, request it
  if (!cameraPermission || !mediaPermission) {
    return <View />
  }
  // If permission is denied, show a message and a button to request permission
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
      {showCamera && isFocused ? (
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
                // Upload image if it exists
                let imageUrl: string | undefined = undefined;
                if (image) {
                  imageUrl = await uploadImageToSupabase(image) || undefined;
                }
                // Save note with image URL
                await notesContext?.addNote(title.trim(), content.trim(), imageUrl);
                // Send local push notification (oppgavekrav)
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `Nytt notat: ${title.trim()}`,
                    body: content.trim(),
                  },
                  trigger: null,
                });
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
    justifyContent: "center",
    alignItems: "center",
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