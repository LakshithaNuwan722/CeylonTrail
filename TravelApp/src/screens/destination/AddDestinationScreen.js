import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image, FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";

const CATEGORIES = ["beach", "mountain", "city", "cultural", "adventure", "wildlife"];

const AddDestinationScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "", description: "", location: "",
    country: "", category: "", entryFee: "",
    bestTimeToVisit: "", climate: "", popularAttractions: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images", 
    allowsMultipleSelection: true,
    quality: 0.8,
   });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!form.name || !form.description || !form.location || !form.country || !form.category) {
      Alert.alert("Error", "Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });
      images.forEach((img, index) => {
        const filename = img.uri.split("/").pop();
        const fileType = filename.split(".").pop();
        formData.append("images", { uri: img.uri, name: filename, type: `image/${fileType}` });
      });

      await api.post("/destinations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Destination added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add destination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Add New Destination</Text>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
        <Text style={styles.imagePickerText}>📷 Add Images (Max 5)</Text>
        <Text style={styles.imagePickerSub}>{images.length} selected</Text>
      </TouchableOpacity>

      {/* Image Previews */}
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
          {images.map((img, index) => (
            <View key={index} style={styles.imagePreview}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(index)}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Form Fields */}
      {[
        { label: "Destination Name *", field: "name", placeholder: "e.g. Eiffel Tower" },
        { label: "Location *", field: "location", placeholder: "e.g. Paris" },
        { label: "Country *", field: "country", placeholder: "e.g. France" },
        { label: "Entry Fee ($)", field: "entryFee", placeholder: "0 for free", keyboardType: "numeric" },
        { label: "Best Time to Visit", field: "bestTimeToVisit", placeholder: "e.g. April - June" },
        { label: "Climate", field: "climate", placeholder: "e.g. Temperate" },
        { label: "Popular Attractions (comma separated)", field: "popularAttractions", placeholder: "e.g. Tower, Museum" },
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

      {/* Category Selection */}
      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryItem, form.category === cat && styles.categoryItemActive]}
            onPress={() => updateForm("category", cat)}
          >
            <Text style={[styles.categoryItemText, form.category === cat && styles.categoryItemTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Destination</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 20, textAlign: "center" },
  imagePicker: {
    backgroundColor: "#E3F2FD", borderRadius: 12, borderWidth: 2,
    borderColor: "#2196F3", borderStyle: "dashed",
    padding: 20, alignItems: "center", marginBottom: 12,
  },
  imagePickerText: { fontSize: 16, color: "#2196F3", fontWeight: "600" },
  imagePickerSub: { fontSize: 12, color: "#90CAF9", marginTop: 4 },
  imagePreviewContainer: { marginBottom: 16 },
  imagePreview: { position: "relative", marginRight: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImage: {
    position: "absolute", top: -6, right: -6,
    backgroundColor: "#F44336", borderRadius: 10,
    width: 20, height: 20, justifyContent: "center", alignItems: "center",
  },
  removeImageText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  categoryItem: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#ddd",
  },
  categoryItemActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  categoryItemText: { fontSize: 13, color: "#666", textTransform: "capitalize" },
  categoryItemTextActive: { color: "#fff", fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#2196F3", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#90CAF9" },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AddDestinationScreen;