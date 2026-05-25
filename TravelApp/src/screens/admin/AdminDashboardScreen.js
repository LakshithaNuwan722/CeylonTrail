import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ emoji, title, value, color, onPress }) => (
  <TouchableOpacity
    style={[styles.statCard, { borderTopColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const AdminDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data.data);
    } catch (error) {
      console.log("Dashboard error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // ─── All screen names match AdminNavigator.js ────────────────────────────
  const quickActions = [
    { label: "👥 Manage Users", screen: "AdminUsers" },
    { label: "🚗 Manage Drivers", screen: "AdminDrivers" },
    { label: "🌍 Manage Destinations", screen: "AdminDestinations" },
    { label: "📋 Transactions", screen: "AdminTransactions" },
    { label: "⭐ Reviews", screen: "AdminReviews" },
    { label: "👤 My Profile", screen: "AdminProfile" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Welcome, {user?.fullName?.split(" ")[0]}! 👋
          </Text>
          <Text style={styles.roleText}>
            {user?.role?.toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Banner */}
      <View style={styles.revenueBanner}>
        <Text style={styles.revenueLabel}>💰 Total Revenue</Text>
        <Text style={styles.revenueAmount}>
          ${stats?.totalRevenue?.toFixed(2) || "0.00"}
        </Text>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          emoji="👥"
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="#2196F3"
          onPress={() => navigation.navigate("AdminUsers")}
        />
        <StatCard
          emoji="🚗"
          title="Total Drivers"
          value={stats?.totalDrivers || 0}
          color="#4CAF50"
          onPress={() => navigation.navigate("AdminDrivers")}
        />
        <StatCard
          emoji="🌍"
          title="Destinations"
          value={stats?.totalDestinations || 0}
          color="#FF9800"
          onPress={() => navigation.navigate("AdminDestinations")}
        />
        <StatCard
          emoji="⭐"
          title="Reviews"
          value={stats?.totalReviews || 0}
          color="#9C27B0"
          onPress={() => navigation.navigate("AdminReviews")}
        />
      </View>

      {/* Booking Status Breakdown */}
      {stats?.bookingStatusBreakdown?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={styles.statusCard}>
            {stats.bookingStatusBreakdown.map((item) => (
              <View key={item._id} style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                </Text>
                <Text style={styles.statusCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Recent Bookings */}
      {stats?.recentBookings?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <View style={styles.recentList}>
            {stats.recentBookings.map((booking) => (
              <TouchableOpacity
                key={booking._id}
                style={styles.recentItem}
                onPress={() => navigation.navigate("AdminTransactions")}
              >
                <View>
                  <Text style={styles.recentUser}>
                    {booking.userId?.fullName || "Unknown"}
                  </Text>
                  <Text style={styles.recentDestination}>
                    📍 {booking.destinationId?.name || "Unknown"}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>
                  ${booking.pricing?.totalAmount?.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {quickActions.map(({ label, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.quickActionButton}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.quickActionText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#1a237e",
    padding: 24,
    paddingTop: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  roleText: { fontSize: 12, color: "#9FA8DA", marginTop: 2 },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  revenueBanner: {
    backgroundColor: "#2196F3",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  revenueLabel: { color: "#E3F2FD", fontSize: 14 },
  revenueAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statEmoji: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statTitle: { fontSize: 12, color: "#666", marginTop: 4 },
  statusCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: { fontSize: 15, color: "#555" },
  statusCount: { fontSize: 15, fontWeight: "bold", color: "#333" },
  recentList: { marginHorizontal: 16 },
  recentItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  recentUser: { fontSize: 15, fontWeight: "bold", color: "#333" },
  recentDestination: { fontSize: 13, color: "#666", marginTop: 2 },
  recentAmount: { fontSize: 16, fontWeight: "bold", color: "#2196F3" },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 32,
  },
  quickActionButton: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
  },
  quickActionText: { fontSize: 14, color: "#333", fontWeight: "600" },
});

export default AdminDashboardScreen;