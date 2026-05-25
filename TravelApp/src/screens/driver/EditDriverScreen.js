import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Switch, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";
const VEHICLE_TYPES = ["car", "van", "bus", "SUV", "minivan"];
const STATUS_OPTIONS = ["active", "inactive", "suspended"];

const EditDriverScreen = ({ route, navigation }) => {
  const { driver } = route.params;

  const [form, setForm] = useState({
    fullName: driver.fullName || "",
    phone: driver.phone || "",
    vehicleType: driver.vehicle?.vehicleType || "",
    vehicleName: driver.vehicle?.vehicleName || "",
    vehicleModel: driver.vehicle?.vehicleModel || "",
    plateNumber: driver.vehicle?.plateNumber || "",
    capacity: driver.vehicle?.capacity?.toString() || "",
    pricePerDay: driver.vehicle?.pricePerDay?.toString() || "",
    status: driver.status || "active",
  });

  const [availability, setAvailability] = useState(driver.availability);
  const [newImages, setNewImages] = useState({
    profileImage: null,
    licenseImage: null,
    vehicleImage: null,
  });
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

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
      setNewImages((prev) => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  const handleUpdate = async () => {
    if (!form.fullName || !form.vehicleType || !form.vehicleName) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });
      formData.append("availability", availability.toString());

      ["profileImage", "licenseImage", "vehicleImage"].forEach((field) => {
        if (newImages[field]) {
          const filename = newImages[field].uri.split("/").pop();
          formData.append(field, {
            uri: newImages[field].uri,
            name: filename,
            type: `image/${filename.split(".").pop()}`,
          });
        }
      });

      await api.put(`/drivers/${driver._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Driver updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const ImageRow = ({ field, label, currentPath }) => (
    <View style={styles.imageRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.imageRowContent}>
        {newImages[field] ? (
          <Image source={{ uri: newImages[field].uri }} style={styles.smallImage} />
        ) : currentPath ? (
          <Image source={{ uri: getImageUrl(currentPath) }} style={styles.smallImage} />
        ) : (
          <View style={[styles.smallImage, styles.imagePlaceholder]}>
            <Text>📷</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={() => pickImage(field)}
        >
          <Text style={styles.changeImageText}>Change</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Edit Driver</Text>

      {/* Images */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Images</Text>
        <ImageRow field="profileImage" label="Profile Photo" currentPath={driver.profileImage} />
        <ImageRow field="licenseImage" label="License Image" currentPath={driver.licenseImage} />
        <ImageRow field="vehicleImage" label="Vehicle Image" currentPath={driver.vehicle?.vehicleImage} />
      </View>

      {/* Driver Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Driver Information</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={form.fullName}
          onChangeText={(v) => updateForm("fullName", v)}
          placeholder="Driver full name"
        />

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(v) => updateForm("phone", v)}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        {/* Availability Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Available for Booking</Text>
          <Switch
            value={availability}
            onValueChange={setAvailability}
            trackColor={{ false: "#ddd", true: "#A5D6A7" }}
            thumbColor={availability ? "#4CAF50" : "#999"}
          />
        </View>

        {/* Status Dropdown */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusOption,
                form.status === status && styles.statusOptionActive,
              ]}
              onPress={() => updateForm("status", status)}
            >
              <Text style={[
                styles.statusOptionText,
                form.status === status && styles.statusOptionTextActive,
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vehicle Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚗 Vehicle Information</Text>

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
          { label: "Capacity *", field: "capacity", placeholder: "Number of passengers", keyboard: "numeric" },
          { label: "Price Per Day ($) *", field: "pricePerDay", placeholder: "Daily rate", keyboard: "numeric" },
        ].map(({ label, field, placeholder, keyboard }) => (
          <View key={field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[field]}
              onChangeText={(v) => updateForm(field, v)}
              placeholder={placeholder}
              keyboardType={keyboard || "default"}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Update Driver</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 16, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 14 },
  imageRow: { marginBottom: 12 },
  imageRowContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  smallImage: { width: 70, height: 70, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  changeImageButton: {
    backgroundColor: "#E3F2FD", borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  changeImageText: { color: "#2196F3", fontWeight: "600", fontSize: 14 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#fafafa", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  switchRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 12,
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusOption: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: "#f0f0f0", alignItems: "center", borderWidth: 1, borderColor: "#ddd",
  },
  statusOptionActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  statusOptionText: { fontSize: 13, color: "#666", fontWeight: "500" },
  statusOptionTextActive: { color: "#fff", fontWeight: "bold" },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  typeItem: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f0f0f0", borderWidth: 1, borderColor: "#ddd",
  },
  typeItemActive: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  typeText: { fontSize: 12, color: "#666", fontWeight: "600" },
  typeTextActive: { color: "#fff" },
  updateButton: {
    backgroundColor: "#FF9800", borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  disabledButton: { backgroundColor: "#FFCC80" },
  updateButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: {
    borderRadius: 12, padding: 16, alignItems: "center",
    marginTop: 12, borderWidth: 1, borderColor: "#ddd",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
});

export default EditDriverScreen;