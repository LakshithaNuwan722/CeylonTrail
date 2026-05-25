import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

import { BASE_URL } from "../../api/axiosConfig";

const DriverDetailScreen = ({ route, navigation }) => {
  const { driverId } = route.params;
  const { isAdmin } = useAuth();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchDriver = async () => {
    try {
      const response = await api.get(`/drivers/${driverId}`);
      setDriver(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load driver details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Driver", "Are you sure you want to remove this driver?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/drivers/${driverId}`);
            Alert.alert("Success", "Driver removed successfully", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert("Error", "Failed to delete driver");
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await api.patch(`/drivers/${driverId}/availability`);
      setDriver(response.data.data);
      Alert.alert(
        "Updated",
        `Driver is now ${response.data.data.availability ? "Available" : "Unavailable"}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update availability");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={{ fontSize: 20, color: star <= rating ? "#FF9800" : "#ddd" }}>
        ★
      </Text>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Driver Header */}
      <View style={styles.header}>
        {driver?.profileImage ? (
          <Image
            source={{ uri: getImageUrl(driver.profileImage) }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.driverName}>{driver?.fullName}</Text>

        {/* Rating Stars */}
        <View style={styles.starsRow}>
          {renderStars(Math.round(driver?.rating || 0))}
          <Text style={styles.ratingText}>
            {driver?.rating > 0 ? ` (${driver.rating})` : " New Driver"}
          </Text>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: driver?.availability ? "#E8F5E9" : "#FFEBEE" }
        ]}>
          <Text style={[
            styles.statusText,
            { color: driver?.availability ? "#4CAF50" : "#F44336" }
          ]}>
            {driver?.availability ? "✅ Available" : "❌ Unavailable"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Contact Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{driver?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone</Text>
            <Text style={styles.infoValue}>{driver?.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🪪 License</Text>
            <Text style={styles.infoValue}>
              {"*".repeat(6) + driver?.licenseNumber?.slice(-4)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✅ Total Trips</Text>
            <Text style={styles.infoValue}>{driver?.totalTrips} trips</Text>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Vehicle Information</Text>
          {driver?.vehicle?.vehicleImage && (
            <Image
              source={{ uri: getImageUrl(driver.vehicle.vehicleImage) }}
              style={styles.vehicleImage}
            />
          )}
          <View style={styles.vehicleGrid}>
            {[
              { label: "Type", value: driver?.vehicle?.vehicleType },
              { label: "Name", value: driver?.vehicle?.vehicleName },
              { label: "Model", value: driver?.vehicle?.vehicleModel },
              { label: "Plate", value: driver?.vehicle?.plateNumber },
              { label: "Capacity", value: `${driver?.vehicle?.capacity} persons` },
              { label: "Price/Day", value: `$${driver?.vehicle?.pricePerDay}` },
            ].map(({ label, value }) => (
              <View key={label} style={styles.vehicleItem}>
                <Text style={styles.vehicleLabel}>{label}</Text>
                <Text style={styles.vehicleValue}>{value || "N/A"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Book Button */}
        {driver?.availability && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              navigation.navigate("BookingScreen", {
                driverId: driver._id,
                driverName: driver.fullName,
              })
            }
          >
            <Text style={styles.bookButtonText}>📅 Book This Driver</Text>
          </TouchableOpacity>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.cardTitle}>⚙️ Admin Actions</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={handleToggleAvailability}
            >
              <Text style={styles.toggleButtonText}>
                {driver?.availability
                  ? "🔴 Set as Unavailable"
                  : "🟢 Set as Available"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditDriver", { driver })}
            >
              <Text style={styles.editButtonText}>✏️ Edit Driver Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️ Remove Driver</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2196F3", alignItems: "center",
    paddingVertical: 32, paddingHorizontal: 24,
  },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 4, borderColor: "#fff",
  },
  avatarPlaceholder: {
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  avatarEmoji: { fontSize: 52 },
  driverName: {
    fontSize: 24, fontWeight: "bold", color: "#fff",
    marginTop: 12, textAlign: "center",
  },
  starsRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  ratingText: { color: "#fff", fontSize: 14, marginLeft: 4 },
  statusBadge: {
    borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 6, marginTop: 10,
  },
  statusText: { fontWeight: "bold", fontSize: 14 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 16, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 14 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  vehicleImage: {
    width: "100%", height: 180, borderRadius: 12,
    marginBottom: 16, resizeMode: "cover",
  },
  vehicleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  vehicleItem: {
    width: "47%", backgroundColor: "#f9f9f9",
    borderRadius: 10, padding: 12,
  },
  vehicleLabel: { fontSize: 11, color: "#999", textTransform: "uppercase" },
  vehicleValue: { fontSize: 15, fontWeight: "bold", color: "#333", marginTop: 4, textTransform: "capitalize" },
  bookButton: {
    backgroundColor: "#4CAF50", borderRadius: 12,
    padding: 18, alignItems: "center", marginBottom: 16,
  },
  bookButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  adminSection: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 24, elevation: 2,
  },
  toggleButton: {
    backgroundColor: "#E3F2FD", borderRadius: 10,
    padding: 14, alignItems: "center", marginBottom: 10,
  },
  toggleButtonText: { color: "#2196F3", fontWeight: "bold", fontSize: 15 },
  editButton: {
    backgroundColor: "#FF9800", borderRadius: 10,
    padding: 14, alignItems: "center", marginBottom: 10,
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  deleteButton: {
    backgroundColor: "#F44336", borderRadius: 10,
    padding: 14, alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default DriverDetailScreen;