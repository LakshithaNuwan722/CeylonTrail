import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";

const VEHICLE_TYPES = ["car", "van", "bus", "SUV", "minivan"];

const AddDriverScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    licenseNumber: "", vehicleType: "",
    vehicleName: "", vehicleModel: "",
    plateNumber: "", capacity: "", pricePerDay: "",
  });

  const [images, setImages] = useState({
    profileImage: null,
    licenseImage: null,
    vehicleImage: null,
  });

  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const pickImage = async (field) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images", 
    allowsEditing: true,
    aspect: field === "profileImage" ? [1, 1] : [4, 3],
    quality: 0.8,
  });

    if (!result.canceled) {
      setImages((prev) => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const ImagePickerField = ({ field, label, emoji }) => (
    <TouchableOpacity style={styles.imagePickerField} onPress={() => pickImage(field)}>
      {images[field] ? (
        <Image source={{ uri: images[field].uri }} style={styles.pickedImage} />
      ) : (
        <View style={styles.imagePickerPlaceholder}>
          <Text style={styles.imagePickerEmoji}>{emoji}</Text>
        </View>
      )}
      <Text style={styles.imagePickerLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const validateForm = () => {
    const required = ["fullName", "email", "phone", "licenseNumber", "vehicleType", "vehicleName", "plateNumber", "capacity", "pricePerDay"];
    for (let field of required) {
      if (!form[field]) {
        Alert.alert("Error", `${field.replace(/([A-Z])/g, " $1")} is required`);
        return false;
      }
    }
    if (isNaN(form.capacity) || isNaN(form.pricePerDay)) {
      Alert.alert("Error", "Capacity and Price must be numbers");
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

      if (images.profileImage) {
        const filename = images.profileImage.uri.split("/").pop();
        formData.append("profileImage", {
          uri: images.profileImage.uri,
          name: filename,
          type: `image/${filename.split(".").pop()}`,
        });
      }
      if (images.licenseImage) {
        const filename = images.licenseImage.uri.split("/").pop();
        formData.append("licenseImage", {
          uri: images.licenseImage.uri,
          name: filename,
          type: `image/${filename.split(".").pop()}`,
        });
      }
      if (images.vehicleImage) {
        const filename = images.vehicleImage.uri.split("/").pop();
        formData.append("vehicleImage", {
          uri: images.vehicleImage.uri,
          name: filename,
          type: `image/${filename.split(".").pop()}`,
        });
      }

      await api.post("/drivers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Driver added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Add New Driver</Text>

      {/* Image Pickers */}
      <View style={styles.imagePickersRow}>
        <ImagePickerField field="profileImage" label="Profile Photo" emoji="👤" />
        <ImagePickerField field="licenseImage" label="License" emoji="🪪" />
        <ImagePickerField field="vehicleImage" label="Vehicle" emoji="🚗" />
      </View>

      {/* Driver Info */}
      <Text style={styles.sectionTitle}>Driver Information</Text>
      {[
        { label: "Full Name *", field: "fullName", placeholder: "Driver's full name" },
        { label: "Email *", field: "email", placeholder: "driver@email.com", keyboard: "email-address" },
        { label: "Phone *", field: "phone", placeholder: "Phone number", keyboard: "phone-pad" },
        { label: "License Number *", field: "licenseNumber", placeholder: "License plate number" },
      ].map(({ label, field, placeholder, keyboard }) => (
        <View key={field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(v) => updateForm(field, v)}
            keyboardType={keyboard || "default"}
            autoCapitalize={field === "email" ? "none" : "words"}
          />
        </View>
      ))}

      {/* Vehicle Info */}
      <Text style={styles.sectionTitle}>Vehicle Information</Text>

      {/* Vehicle Type Selection */}
      <Text style={styles.label}>Vehicle Type *</Text>
      <View style={styles.typeGrid}>
        {VEHICLE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeItem, form.vehicleType === type && styles.typeItemActive]}
            onPress={() => updateForm("vehicleType", type)}
          >
            <Text style={[styles.typeText, form.vehicleType === type && styles.typeTextActive]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {[
        { label: "Vehicle Name *", field: "vehicleName", placeholder: "e.g. Toyota Camry" },
        { label: "Vehicle Model", field: "vehicleModel", placeholder: "e.g. 2022" },
        { label: "Plate Number *", field: "plateNumber", placeholder: "e.g. ABC-1234" },
        { label: "Capacity (persons) *", field: "capacity", placeholder: "e.g. 4", keyboard: "numeric" },
        { label: "Price Per Day ($) *", field: "pricePerDay", placeholder: "e.g. 80", keyboard: "numeric" },
      ].map(({ label, field, placeholder, keyboard }) => (
        <View key={field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(v) => updateForm(field, v)}
            keyboardType={keyboard || "default"}
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Driver</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  imagePickersRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  imagePickerField: { alignItems: "center" },
  pickedImage: { width: 80, height: 80, borderRadius: 12 },
  imagePickerPlaceholder: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#2196F3", borderStyle: "dashed",
  },
  imagePickerEmoji: { fontSize: 32 },
  imagePickerLabel: { fontSize: 12, color: "#666", marginTop: 6, textAlign: "center" },
  sectionTitle: {
    fontSize: 16, fontWeight: "bold", color: "#2196F3",
    marginTop: 20, marginBottom: 8,
    paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#E3F2FD",
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeItem: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#ddd",
  },
  typeItemActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  typeText: { fontSize: 12, color: "#666", fontWeight: "600" },
  typeTextActive: { color: "#fff" },
  submitButton: {
    backgroundColor: "#2196F3", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#90CAF9" },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AddDriverScreen;