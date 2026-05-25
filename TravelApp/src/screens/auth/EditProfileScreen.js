import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;
  const { setUser } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images", 
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    });   
    if (!result.canceled) setNewImage(result.assets[0]);
  };

  const validateForm = () => {
    if (!fullName.trim() || fullName.length < 3) {
      Alert.alert("Error", "Full name must be at least 3 characters");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      if (phone) formData.append("phone", phone);
      if (newImage) {
        const filename = newImage.uri.split("/").pop();
        const fileType = filename.split(".").pop();
        formData.append("profileImage", {
          uri: newImage.uri,
          name: filename,
          type: `image/${fileType}`,
        });
      }

      const response = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data.data);
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const currentImage = newImage
    ? newImage.uri
    : profile?.profileImage
    ? getImageUrl(profile.profileImage)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {currentImage ? (
          <Image source={{ uri: currentImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.placeholderEmoji}>📷</Text>
            <Text style={styles.placeholderText}>Change Photo</Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>✏️</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 24, alignItems: "center" },
  imagePicker: { position: "relative", marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#2196F3", borderStyle: "dashed",
  },
  placeholderEmoji: { fontSize: 36 },
  placeholderText: { fontSize: 12, color: "#2196F3", marginTop: 4 },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#2196F3", borderRadius: 16,
    width: 32, height: 32, justifyContent: "center", alignItems: "center",
  },
  editBadgeText: { fontSize: 14 },
  form: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 24,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 14, fontSize: 16, backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#2196F3", borderRadius: 10,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#90CAF9" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    borderRadius: 10, padding: 16, alignItems: "center", marginTop: 12,
    borderWidth: 1, borderColor: "#ddd",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
});

export default EditProfileScreen;