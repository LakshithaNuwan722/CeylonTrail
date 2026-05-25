import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  Image, TouchableOpacity, ActivityIndicator,
  Alert, FlatList, Dimensions,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");
import { BASE_URL } from "../../api/axiosConfig";

const DestinationDetailScreen = ({ route, navigation }) => {
  const { destinationId } = route.params;
  const { isAdmin } = useAuth();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchDestination();
  }, []);

  const fetchDestination = async () => {
    try {
      const response = await api.get(`/destinations/${destinationId}`);
      setDestination(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load destination");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Destination", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/destinations/${destinationId}`);
            Alert.alert("Success", "Destination deleted", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Image Carousel */}
      {destination?.images?.length > 0 ? (
        <View>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={destination.images}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: getImageUrl(item) }}
                style={[styles.image, { width }]}
              />
            )}
          />
          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {destination.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeImage === i && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderEmoji}>🌍</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Title & Category */}
        <View style={styles.titleRow}>
          <Text style={styles.name}>{destination?.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{destination?.category}</Text>
          </View>
        </View>

        <Text style={styles.location}>
          📍 {destination?.location}, {destination?.country}
        </Text>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🌤️ Climate</Text>
            <Text style={styles.infoValue}>
              {destination?.climate || "Varies"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🎟️ Entry Fee</Text>
            <Text style={styles.infoValue}>
              {destination?.entryFee > 0
                ? `$${destination.entryFee}`
                : "Free"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>📅 Best Time</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {destination?.bestTimeToVisit || "Anytime"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{destination?.description}</Text>

        {/* Popular Attractions */}
        {destination?.popularAttractions?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Popular Attractions</Text>
            {destination.popularAttractions.map((attr, index) => (
              <View key={index} style={styles.attractionItem}>
                <Text style={styles.attractionBullet}>🎯</Text>
                <Text style={styles.attractionText}>{attr}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate("BookingScreen", {
              destinationId: destination._id,
              destinationName: destination.name,
            })
          }
        >
          <Text style={styles.bookButtonText}>🚗 Book a Trip Here</Text>
        </TouchableOpacity>

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                navigation.navigate("EditDestination", { destination })
              }
            >
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
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
  image: { height: 280, resizeMode: "cover" },
  imagePlaceholder: {
    height: 280, backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  placeholderEmoji: { fontSize: 80 },
  dotsContainer: {
    flexDirection: "row", justifyContent: "center",
    position: "absolute", bottom: 12, width: "100%",
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff", opacity: 0.5, marginHorizontal: 3 },
  dotActive: { opacity: 1, backgroundColor: "#2196F3" },
  content: { padding: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 24, fontWeight: "bold", color: "#333", flex: 1, marginRight: 8 },
  badge: { backgroundColor: "#E3F2FD", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: "#2196F3", fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  location: { fontSize: 15, color: "#666", marginTop: 6 },
  infoRow: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 12,
    padding: 16, marginTop: 16, justifyContent: "space-between",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  infoItem: { alignItems: "center", flex: 1 },
  infoLabel: { fontSize: 11, color: "#999", marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: "bold", color: "#333", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 10 },
  description: { fontSize: 15, color: "#555", lineHeight: 24 },
  attractionItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  attractionBullet: { fontSize: 16, marginRight: 8 },
  attractionText: { fontSize: 15, color: "#555" },
  bookButton: {
    backgroundColor: "#2196F3", borderRadius: 12,
    padding: 18, alignItems: "center", marginTop: 24,
  },
  bookButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  adminActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  editButton: {
    flex: 1, backgroundColor: "#FF9800", borderRadius: 12,
    padding: 14, alignItems: "center",
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  deleteButton: {
    flex: 1, backgroundColor: "#F44336", borderRadius: 12,
    padding: 14, alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default DestinationDetailScreen;