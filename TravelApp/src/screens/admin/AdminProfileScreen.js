import React from "react";
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

import { BASE_URL } from "../../api/axiosConfig";

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {user?.profileImage ? (
          <Image
            source={{ uri: getImageUrl(user.profileImage) }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>🛡️</Text>
          </View>
        )}
        <Text style={styles.adminName}>{user?.fullName}</Text>
        <Text style={styles.adminEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role?.toUpperCase() || "ADMIN"}
          </Text>
        </View>
      </View>

      {/* Permissions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔑 Permissions</Text>
        {user?.permissions &&
          Object.entries(user.permissions).map(([key, value]) => (
            <View key={key} style={styles.permRow}>
              <Text style={styles.permLabel}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </Text>
              <Text style={[styles.permStatus, { color: value ? "#4CAF50" : "#F44336" }]}>
                {value ? "✅ Allowed" : "❌ Denied"}
              </Text>
            </View>
          ))}
      </View>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Account Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        {user?.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        )}
        {user?.lastLogin && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Last Login</Text>
            <Text style={styles.infoValue}>
              {new Date(user.lastLogin).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>🚪 Logout from Admin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1a237e", alignItems: "center",
    paddingVertical: 40, paddingHorizontal: 24,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: "#fff",
  },
  avatarPlaceholder: {
    backgroundColor: "#283593", justifyContent: "center", alignItems: "center",
  },
  avatarEmoji: { fontSize: 48 },
  adminName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 12 },
  adminEmail: { fontSize: 14, color: "#9FA8DA", marginTop: 4 },
  roleBadge: {
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 4, marginTop: 8,
  },
  roleText: { color: "#1a237e", fontWeight: "bold", fontSize: 12 },
  card: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  permRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  permLabel: { fontSize: 14, color: "#555" },
  permStatus: { fontSize: 13, fontWeight: "bold" },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "600" },
  logoutButton: {
    backgroundColor: "#F44336", margin: 16, borderRadius: 12,
    padding: 16, alignItems: "center", marginBottom: 40,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AdminProfileScreen;