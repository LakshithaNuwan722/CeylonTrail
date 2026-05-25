import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

import { BASE_URL } from "../../api/axiosConfig";
const VEHICLE_TYPES = ["All", "car", "van", "bus", "SUV", "minivan"];

const DriverListScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, [selectedType, availableOnly]);

  const fetchDrivers = async () => {
    try {
      let url = "/drivers?";
      if (selectedType !== "All") url += `vehicleType=${selectedType}&`;
      if (availableOnly) url += `availability=true`;

      const response = await api.get(url);
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
  }, [selectedType, availableOnly]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderStar = (rating) => {
    const stars = Math.round(rating);
    return "⭐".repeat(stars) || "No ratings";
  };

  const renderDriver = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DriverDetail", { driverId: item._id })}
    >
      <View style={styles.cardHeader}>
        {item.profileImage ? (
          <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.fullName}</Text>
          <Text style={styles.vehicleType}>
            🚙 {item.vehicle?.vehicleType?.toUpperCase()}
          </Text>
          <Text style={styles.rating}>
            {item.rating > 0 ? renderStar(item.rating) + ` (${item.rating})` : "⭐ New Driver"}
          </Text>
        </View>
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: item.availability ? "#E8F5E9" : "#FFEBEE" }
        ]}>
          <Text style={[
            styles.availabilityText,
            { color: item.availability ? "#4CAF50" : "#F44336" }
          ]}>
            {item.availability ? "Available" : "Busy"}
          </Text>
        </View>
      </View>

      <View style={styles.vehicleDetails}>
        <Text style={styles.vehicleName}>
          🚗 {item.vehicle?.vehicleName} {item.vehicle?.vehicleModel}
        </Text>
        <Text style={styles.vehicleCapacity}>
          👥 {item.vehicle?.capacity} passengers
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>
          💰 ${item.vehicle?.pricePerDay}/day
        </Text>
        <Text style={styles.trips}>
          {item.totalTrips} trips completed
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Available Only Toggle */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.toggleButton, availableOnly && styles.toggleButtonActive]}
          onPress={() => { setAvailableOnly(!availableOnly); setLoading(true); }}
        >
          <Text style={[styles.toggleText, availableOnly && styles.toggleTextActive]}>
            {availableOnly ? "✅ Available Only" : "Show All Drivers"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle Type Filter */}
      <FlatList
        horizontal
        data={VEHICLE_TYPES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilter}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.typeChip, selectedType === item && styles.typeChipActive]}
            onPress={() => { setSelectedType(item); setLoading(true); }}
          >
            <Text style={[styles.typeChipText, selectedType === item && styles.typeChipTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Driver List */}
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
              <Text style={styles.emptyText}>No drivers found</Text>
            </View>
          }
        />
      )}

      {/* Admin Add Button */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddDriver")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  filterBar: {
    backgroundColor: "#fff", padding: 12,
    flexDirection: "row", justifyContent: "flex-end",
  },
  toggleButton: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  toggleButtonActive: { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" },
  toggleText: { fontSize: 13, color: "#666" },
  toggleTextActive: { color: "#4CAF50", fontWeight: "600" },
  typeFilter: { maxHeight: 50, backgroundColor: "#fff", paddingVertical: 8 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#f0f0f0", marginRight: 8,
  },
  typeChipActive: { backgroundColor: "#2196F3" },
  typeChipText: { color: "#666", fontSize: 13 },
  typeChipTextActive: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 16,
    padding: 16, elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  avatarEmoji: { fontSize: 32 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 17, fontWeight: "bold", color: "#333" },
  vehicleType: { fontSize: 13, color: "#666", marginTop: 2 },
  rating: { fontSize: 12, color: "#FF9800", marginTop: 2 },
  availabilityBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  availabilityText: { fontSize: 12, fontWeight: "bold" },
  vehicleDetails: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0",
  },
  vehicleName: { fontSize: 14, color: "#555" },
  vehicleCapacity: { fontSize: 14, color: "#555" },
  cardFooter: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 8,
  },
  price: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },
  trips: { fontSize: 13, color: "#999" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 16 },
  fab: {
    position: "absolute", right: 24, bottom: 24,
    backgroundColor: "#2196F3", width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
});

export default DriverListScreen;