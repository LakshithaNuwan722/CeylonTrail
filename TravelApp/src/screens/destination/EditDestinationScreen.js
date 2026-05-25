import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";
const CATEGORIES = ["beach", "mountain", "city", "cultural", "adventure", "wildlife"];

const EditDestinationScreen = ({ route, navigation }) => {
  const { destination } = route.params;

  const [form, setForm] = useState({
    name: destination.name || "",
    description: destination.description || "",
    location: destination.location || "",
    country: destination.country || "",
    category: destination.category || "",
    entryFee: destination.entryFee?.toString() || "0",
    bestTimeToVisit: destination.bestTimeToVisit || "",
    climate: destination.climate || "",
    popularAttractions: destination.popularAttractions?.join(", ") || "",
  });

  const [existingImages, setExistingImages] = useState(destination.images || []);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images", 
    allowsMultipleSelection: true,
    quality: 0.8,
   });

    if (!result.canceled) {
      const total = existingImages.length + newImages.length + result.assets.length;
      if (total > 5) {
        Alert.alert("Limit Reached", "Maximum 5 images allowed");
        return;
      }
      setNewImages((prev) => [...prev, ...result.assets]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!form.name || !form.description || !form.location || !form.country || !form.category) {
      Alert.alert("Error", "Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });

      // Send existing images that were kept
      existingImages.forEach((img) => {
        formData.append("existingImages", img);
      });

      // Send new images
      newImages.forEach((img) => {
        const filename = img.uri.split("/").pop();
        const fileType = filename.split(".").pop();
        formData.append("images", {
          uri: img.uri,
          name: filename,
          type: `image/${fileType}`,
        });
      });

      await api.put(`/destinations/${destination._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Destination updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Edit Destination</Text>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Current Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {existingImages.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: getImageUrl(img) }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => removeExistingImage(index)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Add New Images */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        <Text style={styles.imagePickerText}>📷 Add More Images</Text>
        <Text style={styles.imagePickerSub}>
          {existingImages.length + newImages.length}/5 total
        </Text>
      </TouchableOpacity>

      {/* New Image Previews */}
      {newImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newImagesRow}>
          {newImages.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => removeNewImage(index)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Form Fields */}
      {[
        { label: "Destination Name *", field: "name", placeholder: "e.g. Eiffel Tower" },
        { label: "Location *", field: "location", placeholder: "e.g. Paris" },
        { label: "Country *", field: "country", placeholder: "e.g. France" },
        { label: "Entry Fee ($)", field: "entryFee", placeholder: "0", keyboardType: "numeric" },
        { label: "Best Time to Visit", field: "bestTimeToVisit", placeholder: "e.g. April - June" },
        { label: "Climate", field: "climate", placeholder: "e.g. Temperate" },
        {
          label: "Popular Attractions (comma separated)",
          field: "popularAttractions",
          placeholder: "e.g. Tower, Museum",
        },
      ].map(({ label, field, placeholder, keyboardType }) => (
        <View key={field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(v) => updateForm(field, v)}
            keyboardType={keyboardType || "default"}
          />
        </View>
      ))}

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe this destination..."
        value={form.description}
        onChangeText={(v) => updateForm("description", v)}
        multiline
        numberOfLines={4}
      />

      {/* Category */}
      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryItem,
              form.category === cat && styles.categoryItemActive,
            ]}
            onPress={() => updateForm("category", cat)}
          >
            <Text
              style={[
                styles.categoryItemText,
                form.category === cat && styles.categoryItemTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Update Destination</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: {
    fontSize: 22, fontWeight: "bold", color: "#333",
    textAlign: "center", marginBottom: 20,
  },
  section: { marginBottom: 16 },
  label: {
    fontSize: 14, fontWeight: "600", color: "#333",
    marginBottom: 8, marginTop: 12,
  },
  imagePicker: {
    backgroundColor: "#E3F2FD", borderRadius: 12,
    borderWidth: 2, borderColor: "#2196F3", borderStyle: "dashed",
    padding: 16, alignItems: "center", marginBottom: 8,
  },
  imagePickerText: { fontSize: 15, color: "#2196F3", fontWeight: "600" },
  imagePickerSub: { fontSize: 12, color: "#90CAF9", marginTop: 4 },
  newImagesRow: { marginBottom: 12 },
  imageContainer: { position: "relative", marginRight: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImage: {
    position: "absolute", top: -6, right: -6,
    backgroundColor: "#F44336", borderRadius: 10,
    width: 20, height: 20, justifyContent: "center", alignItems: "center",
  },
  removeImageText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  newBadge: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(33,150,243,0.8)",
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    alignItems: "center", paddingVertical: 2,
  },
  newBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  categoryItem: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#ddd",
  },
  categoryItemActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  categoryItemText: { fontSize: 13, color: "#666", textTransform: "capitalize" },
  categoryItemTextActive: { color: "#fff", fontWeight: "bold" },
  updateButton: {
    backgroundColor: "#FF9800", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#FFCC80" },
  updateButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: {
    borderRadius: 12, padding: 16, alignItems: "center",
    marginTop: 12, borderWidth: 1, borderColor: "#ddd",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
});

export default EditDestinationScreen;