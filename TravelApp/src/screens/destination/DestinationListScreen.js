import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Image, ActivityIndicator, RefreshControl,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

import { BASE_URL } from "../../api/axiosConfig";

const CATEGORIES = ["All", "beach", "mountain", "city", "cultural", "adventure", "wildlife"];

const DestinationListScreen = ({ navigation }) => {
  const { isAdmin } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchDestinations();
  }, [selectedCategory]);

  const fetchDestinations = async () => {
    try {
      let url = "/destinations?";
      if (selectedCategory !== "All") url += `category=${selectedCategory}&`;
      if (search) url += `search=${search}`;

      const response = await api.get(url);
      setDestinations(response.data.data || []);
    } catch (error) {
      console.log("Error fetching destinations:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchDestinations();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDestinations();
  }, [selectedCategory]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive,
      ]}
      onPress={() => {
        setSelectedCategory(item);
        setLoading(true);
      }}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextActive,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderDestination = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("DestinationDetail", { destinationId: item._id })
      }
    >
      {item.images?.[0] ? (
        <Image
          source={{ uri: getImageUrl(item.images[0]) }}
          style={styles.cardImage}
        />
      ) : (
        <View style={[styles.cardImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderEmoji}>🌍</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardLocation}>
          📍 {item.location}, {item.country}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category}</Text>
          </View>
          <Text style={styles.entryFee}>
            {item.entryFee > 0 ? `$${item.entryFee} entry` : "Free Entry"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search destinations..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* Destinations List */}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌍</Text>
              <Text style={styles.emptyText}>No destinations found</Text>
            </View>
          }
        />
      )}

      {/* Admin Add Button */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddDestination")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchContainer: {
    flexDirection: "row", padding: 16,
    backgroundColor: "#fff", gap: 8,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#fafafa",
  },
  searchButton: {
    backgroundColor: "#2196F3", borderRadius: 10,
    paddingHorizontal: 16, justifyContent: "center",
  },
  searchButtonText: { color: "#fff", fontWeight: "bold" },
  categoryList: { maxHeight: 50, backgroundColor: "#fff", paddingVertical: 8 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#f0f0f0", marginRight: 8,
  },
  categoryChipActive: { backgroundColor: "#2196F3" },
  categoryChipText: { color: "#666", fontSize: 13, fontWeight: "500" },
  categoryChipTextActive: { color: "#fff" },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 16,
    overflow: "hidden", elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  cardImage: { width: "100%", height: 200 },
  imagePlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  placeholderEmoji: { fontSize: 60 },
  cardContent: { padding: 16 },
  cardName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardLocation: { fontSize: 14, color: "#666", marginTop: 4 },
  cardDescription: { fontSize: 14, color: "#555", marginTop: 8, lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  badge: { backgroundColor: "#E3F2FD", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#2196F3", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  entryFee: { fontSize: 13, color: "#4CAF50", fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 16 },
  fab: {
    position: "absolute", right: 24, bottom: 24,
    backgroundColor: "#2196F3", width: 56, height: 56,
    borderRadius: 28, justifyContent: "center", alignItems: "center",
    elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
});

export default DestinationListScreen;