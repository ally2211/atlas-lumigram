import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";

const showAlert = (title: string, message?: string) =>
  Platform.OS === "web" ? window.alert([title, message].filter(Boolean).join("\n")) : Alert.alert(title, message);
import * as ImagePicker from "expo-image-picker";
import { uploadPostImage, createPost } from "../../firebase/postsService";
import { auth } from "../../firebase/firebaseConfig";

const AddPost = () => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  console.log("AUTH USER:", auth.currentUser);
  const pickImage = async () => {
    // Ask permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showAlert("Permission required", "Access camera roll.");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddPost = async () => {
    if (!image) {
      showAlert("Please select an image first.");
      return;
    }

    try {
      const imageUrl = await uploadPostImage(image);
      await createPost(imageUrl, caption);

      showAlert("Success", "Post added successfully!");

      setImage(null);
      setCaption("");
    } catch (error) {
      console.error(error);
      showAlert("Error", "Uploading post failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>Tap to select image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.input}
      />

      <Button title="Add Post" onPress={handleAddPost} />
    </View>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imagePicker: {
    height: 250,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#888",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
});