import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { BASE_URL } from "../api/axiosConfig";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [destRes, driverRes] = await Promise.all([
        api.get("/destinations?limit=5"),
        api.get("/drivers?availability=true&limit=5"),
      ]);
      setDestinations(destRes.data.data || []);
      setDrivers(driverRes.data.data || []);
    } catch (error) {
      console.log("Error fetching home data:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <Text style={styles.welcomeText}>
          Hello, {user?.fullName?.split(" ")[0]}! 👋
        </Text>
        <Text style={styles.bannerSubtitle}>
          Where do you want to go today?
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate("Explore")}
        >
          <Text style={styles.quickActionEmoji}>🌍</Text>
          <Text style={styles.quickActionText}>Destinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate("Bookings")}
        >
          <Text style={styles.quickActionEmoji}>📋</Text>
          <Text style={styles.quickActionText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.quickActionEmoji}>👤</Text>
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Destinations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🌍 Popular Destinations</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Explore")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {destinations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No destinations yet</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={destinations}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.destinationCard}
                onPress={() =>
                  navigation.navigate("DestinationDetail", {
                    destinationId: item._id,
                  })
                }
              >
                {item.images?.[0] ? (
                  <Image
                    source={{ uri: getImageUrl(item.images[0]) }}
                    style={styles.destinationImage}
                  />
                ) : (
                  <View style={[styles.destinationImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderEmoji}>🏔️</Text>
                  </View>
                )}
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.destinationLocation} numberOfLines={1}>
                    📍 {item.location}, {item.country}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Available Drivers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚗 Available Drivers</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {drivers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No drivers available</Text>
          </View>
        ) : (
          drivers.map((driver) => (
            <TouchableOpacity
              key={driver._id}
              style={styles.driverCard}
              onPress={() =>
                navigation.navigate("DriverDetail", {
                  driverId: driver._id,
                })
              }
            >
              {driver.profileImage ? (
                <Image
                  source={{ uri: getImageUrl(driver.profileImage) }}
                  style={styles.driverAvatar}
                />
              ) : (
                <View style={[styles.driverAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                </View>
              )}
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.fullName}</Text>
                <Text style={styles.vehicleInfo}>
                  🚙 {driver.vehicle?.vehicleName} (
                  {driver.vehicle?.vehicleType})
                </Text>
                <Text style={styles.priceInfo}>
                  💰 ${driver.vehicle?.pricePerDay}/day
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  ⭐ {driver.rating || "New"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  banner: {
    backgroundColor: "#2196F3",
    padding: 24,
    paddingTop: 48,
  },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  bannerSubtitle: { fontSize: 14, color: "#E3F2FD", marginTop: 4 },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 16,
    elevation: 2,
  },
  quickActionBtn: { alignItems: "center" },
  quickActionEmoji: { fontSize: 32 },
  quickActionText: { fontSize: 12, color: "#333", marginTop: 4, fontWeight: "600" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  seeAll: { color: "#2196F3", fontWeight: "600", fontSize: 14 },
  emptyCard: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 20, alignItems: "center",
  },
  emptyText: { color: "#999", fontSize: 14 },
  destinationCard: {
    width: 180, marginRight: 12, backgroundColor: "#fff",
    borderRadius: 12, overflow: "hidden",
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  destinationImage: { width: "100%", height: 120 },
  imagePlaceholder: {
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  placeholderEmoji: { fontSize: 40 },
  destinationInfo: { padding: 10 },
  destinationName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  destinationLocation: { fontSize: 12, color: "#666", marginTop: 2 },
  categoryBadge: {
    backgroundColor: "#E3F2FD", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
    marginTop: 6, alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 10, color: "#2196F3",
    fontWeight: "600", textTransform: "uppercase",
  },
  driverCard: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 16, marginBottom: 12,
    flexDirection: "row", alignItems: "center",
    elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  driverAvatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
  },
  avatarEmoji: { fontSize: 28 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  vehicleInfo: { fontSize: 13, color: "#666", marginTop: 2 },
  priceInfo: { fontSize: 13, color: "#4CAF50", marginTop: 2, fontWeight: "600" },
  ratingContainer: { alignItems: "center" },
  ratingText: { fontSize: 14, fontWeight: "bold", color: "#FF9800" },
});

export default HomeScreen;