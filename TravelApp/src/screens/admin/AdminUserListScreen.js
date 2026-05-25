import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, Image,
  ActivityIndicator, RefreshControl, TouchableOpacity,
  Alert, TextInput,
} from "react-native";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const AdminUserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search) {
      setFiltered(
        users.filter(
          (u) =>
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFiltered(users);
    }
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data || []);
      setFiltered(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/users/${userId}`);
              setUsers((prev) => prev.filter((u) => u._id !== userId));
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userRow}>
        {item.profileImage ? (
          <Image
            source={{ uri: getImageUrl(item.profileImage) }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone && (
            <Text style={styles.userPhone}>📱 {item.phone}</Text>
          )}
          <Text style={styles.userDate}>
            Joined: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.isActive ? "#4CAF50" : "#F44336" }
          ]} />
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteUser(item._id, item.fullName)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          👥 Total Users: <Text style={styles.summaryCount}>{users.length}</Text>
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by name or email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  summaryBar: {
    backgroundColor: "#2196F3", padding: 12,
    paddingHorizontal: 16,
  },
  summaryText: { color: "#E3F2FD", fontSize: 14 },
  summaryCount: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  searchContainer: { padding: 12, backgroundColor: "#fff" },
  searchInput: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 12, fontSize: 15, backgroundColor: "#fafafa",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarPlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  avatarEmoji: { fontSize: 26 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 13, color: "#666", marginTop: 2 },
  userPhone: { fontSize: 13, color: "#666", marginTop: 2 },
  userDate: { fontSize: 12, color: "#999", marginTop: 3 },
  actions: { alignItems: "center", gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  deleteBtn: {
    backgroundColor: "#FFEBEE", borderRadius: 8,
    padding: 8,
  },
  deleteBtnText: { fontSize: 18 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});

export default AdminUserListScreen;