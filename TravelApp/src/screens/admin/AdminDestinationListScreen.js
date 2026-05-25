import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, Image,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from "react-native";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const AdminDestinationListScreen = ({ navigation }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDestinations();
    const unsubscribe = navigation.addListener("focus", fetchDestinations);
    return unsubscribe;
  }, [navigation]);

  const fetchDestinations = async () => {
    try {
      const response = await api.get("/destinations");
      setDestinations(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDestinations();
  }, []);

  const handleDelete = (destId, destName) => {
    Alert.alert("Delete Destination", `Remove "${destName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/destinations/${destId}`);
            setDestinations((prev) => prev.filter((d) => d._id !== destId));
            Alert.alert("Deleted", "Destination removed successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete destination");
          }
        },
      },
    ]);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderDestination = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        {item.images?.[0] ? (
          <Image source={{ uri: getImageUrl(item.images[0]) }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={{ fontSize: 28 }}>🌍</Text>
          </View>
        )}
        <View style={styles.destInfo}>
          <Text style={styles.destName}>{item.name}</Text>
          <Text style={styles.destLocation}>📍 {item.location}, {item.country}</Text>
          <View style={styles.destMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.entryFee}>
              {item.entryFee > 0 ? `$${item.entryFee}` : "Free"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditDestination", { destination: item })}
        >
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id, item.name)}
        >
          <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🌍 Destinations: <Text style={styles.headerCount}>{destinations.length}</Text>
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddDestination")}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(item) => item._id}
          renderItem={renderDestination}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={styles.emptyText}>No destinations added yet</Text>
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
    backgroundColor: "#4CAF50", borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 14,
    marginBottom: 14, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardRow: { flexDirection: "row", marginBottom: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 10 },
  thumbnailPlaceholder: {
    backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center",
  },
  destInfo: { flex: 1, marginLeft: 12 },
  destName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  destLocation: { fontSize: 13, color: "#666", marginTop: 3 },
  destMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  categoryBadge: {
    backgroundColor: "#E3F2FD", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  categoryText: { color: "#2196F3", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  entryFee: { fontSize: 13, color: "#4CAF50", fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 10 },
  editBtn: {
    flex: 1, backgroundColor: "#FFF8E1", borderRadius: 8,
    padding: 10, alignItems: "center",
  },
  editBtnText: { color: "#FF9800", fontWeight: "bold", fontSize: 13 },
  deleteBtn: {
    flex: 1, backgroundColor: "#FFEBEE", borderRadius: 8,
    padding: 10, alignItems: "center",
  },
  deleteBtnText: { color: "#F44336", fontWeight: "bold", fontSize: 13 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});

export default AdminDestinationListScreen;