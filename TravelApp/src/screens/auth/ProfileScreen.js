import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setProfile(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/users/${user._id}`);
              logout();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
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
      {/* Profile Header */}
      <View style={styles.header}>
        {profile?.profileImage ? (
          <Image
            source={{ uri: getImageUrl(profile.profileImage) }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.name}>{profile?.fullName}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{profile?.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Phone</Text>
          <Text style={styles.infoValue}>
            {profile?.phone || "Not provided"}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Member Since</Text>
          <Text style={styles.infoValue}>
            {new Date(profile?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditProfile", { profile })
          }
        >
          <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => navigation.navigate("Bookings")}
        >
          <Text style={styles.bookingsButtonText}>📋 My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#2196F3",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#fff",
  },
  avatarEmoji: { fontSize: 48 },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 12 },
  email: { fontSize: 14, color: "#E3F2FD", marginTop: 4 },
  roleBadge: {
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 4, marginTop: 8,
  },
  roleText: { color: "#2196F3", fontWeight: "bold", fontSize: 12 },
  infoCard: {
    backgroundColor: "#fff", margin: 16, borderRadius: 12, padding: 16,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 12,
  },
  infoLabel: { fontSize: 14, color: "#666", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  actions: { paddingHorizontal: 16, paddingBottom: 32 },
  editButton: {
    backgroundColor: "#2196F3", borderRadius: 12,
    padding: 16, alignItems: "center", marginBottom: 12,
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  bookingsButton: {
    backgroundColor: "#4CAF50", borderRadius: 12,
    padding: 16, alignItems: "center", marginBottom: 12,
  },
  bookingsButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logoutButton: {
    backgroundColor: "#FF9800", borderRadius: 12,
    padding: 16, alignItems: "center", marginBottom: 12,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  deleteButton: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1,
    borderColor: "#F44336", padding: 16, alignItems: "center",
  },
  deleteButtonText: { color: "#F44336", fontWeight: "bold", fontSize: 16 },
});

export default ProfileScreen;