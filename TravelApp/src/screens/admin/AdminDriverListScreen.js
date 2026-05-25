import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, Image,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from "react-native";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const AdminDriverListScreen = ({ navigation }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get("/drivers");
      setDrivers(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDrivers();
  }, []);

  const handleDelete = (driverId, driverName) => {
    Alert.alert("Delete Driver", `Remove ${driverName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/drivers/${driverId}`);
            setDrivers((prev) => prev.filter((d) => d._id !== driverId));
            Alert.alert("Success", "Driver removed");
          } catch (error) {
            Alert.alert("Error", "Failed to delete driver");
          }
        },
      },
    ]);
  };

  const handleToggle = async (driverId) => {
    try {
      const response = await api.patch(`/drivers/${driverId}/availability`);
      setDrivers((prev) =>
        prev.map((d) =>
          d._id === driverId ? { ...d, availability: response.data.data.availability } : d
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to toggle availability");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderDriver = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.profileImage ? (
          <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
        )}
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.fullName}</Text>
          <Text style={styles.driverEmail}>{item.email}</Text>
          <Text style={styles.vehicleInfo}>
            🚗 {item.vehicle?.vehicleName} • ${item.vehicle?.pricePerDay}/day
          </Text>
          <Text style={styles.tripsInfo}>
            ✅ {item.totalTrips} trips • ⭐ {item.rating || 0}
          </Text>
        </View>
      </View>

      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === "active" ? "#E8F5E9" : "#FFEBEE" }
        ]}>
          <Text style={{
            color: item.status === "active" ? "#4CAF50" : "#F44336",
            fontSize: 12, fontWeight: "bold",
          }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View style={[
          styles.availBadge,
          { backgroundColor: item.availability ? "#E8F5E9" : "#FFF8E1" }
        ]}>
          <Text style={{
            color: item.availability ? "#4CAF50" : "#FF9800",
            fontSize: 12, fontWeight: "bold",
          }}>
            {item.availability ? "AVAILABLE" : "BUSY"}
          </Text>
        </View>
      </View>

      {/* Admin Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => handleToggle(item._id)}
        >
          <Text style={styles.toggleBtnText}>
            {item.availability ? "🔴 Set Busy" : "🟢 Set Available"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditDriver", { driver: item })}
        >
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id, item.fullName)}
        >
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🚗 Total Drivers: <Text style={styles.headerCount}>{drivers.length}</Text>
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddDriver")}
        >
          <Text style={styles.addButtonText}>+ Add Driver</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id}
          renderItem={renderDriver}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🚗</Text>
              <Text style={styles.emptyText}>No drivers yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff", padding: 16,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", elevation: 2,
  },
  headerTitle: { fontSize: 15, color: "#555" },
  headerCount: { color: "#2196F3", fontWeight: "bold", fontSize: 18 },
  addButton: {
    backgroundColor: "#2196F3", borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 14, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: { flexDirection: "row", marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  driverEmail: { fontSize: 13, color: "#666", marginTop: 2 },
  vehicleInfo: { fontSize: 13, color: "#555", marginTop: 3 },
  tripsInfo: { fontSize: 12, color: "#999", marginTop: 3 },
  statusRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  availBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  actionRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1, backgroundColor: "#E3F2FD", borderRadius: 8,
    padding: 10, alignItems: "center",
  },
  toggleBtnText: { color: "#2196F3", fontWeight: "600", fontSize: 12 },
  editBtn: {
    flex: 1, backgroundColor: "#FFF8E1", borderRadius: 8,
    padding: 10, alignItems: "center",
  },
  editBtnText: { color: "#FF9800", fontWeight: "600", fontSize: 12 },
  deleteBtn: {
    backgroundColor: "#FFEBEE", borderRadius: 8,
    padding: 10, alignItems: "center", width: 44,
  },
  deleteBtnText: { fontSize: 18 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});

export default AdminDriverListScreen;