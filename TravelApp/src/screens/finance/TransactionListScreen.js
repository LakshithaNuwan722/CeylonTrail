import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import api from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS = {
  pending: { bg: "#FFF8E1", text: "#FF9800" },
  confirmed: { bg: "#E3F2FD", text: "#2196F3" },
  completed: { bg: "#E8F5E9", text: "#4CAF50" },
  cancelled: { bg: "#FFEBEE", text: "#F44336" },
};

const TransactionListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/transactions/user/${user._id}`);
      setTransactions(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.bookingStatus === filter);

  const renderTransaction = ({ item }) => {
    const statusColor = STATUS_COLORS[item.bookingStatus] || STATUS_COLORS.pending;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("TransactionDetail", { transactionId: item._id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.transactionId}>{item.transactionId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.bookingStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.destinationName}>
          📍 {item.destinationId?.name || "Unknown Destination"}
        </Text>
        <Text style={styles.driverName}>
          🚗 {item.driverId?.fullName || "Unknown Driver"}
        </Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            📅 {new Date(item.tripDetails?.startDate).toLocaleDateString()}
          </Text>
          <Text style={styles.dateText}>→</Text>
          <Text style={styles.dateText}>
            {new Date(item.tripDetails?.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[
            styles.paymentBadge,
            { backgroundColor: item.paymentStatus === "paid" ? "#E8F5E9" : "#FFF8E1" }
          ]}>
            <Text style={{
              color: item.paymentStatus === "paid" ? "#4CAF50" : "#FF9800",
              fontSize: 12, fontWeight: "bold",
            }}>
              {item.paymentStatus.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.totalAmount}>
            ${item.pricing?.totalAmount?.toFixed(2)}
          </Text>
        </View>

        {/* Write review button for completed trips */}
        {item.bookingStatus === "completed" && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate("AddReview", {
                transactionId: item._id,
                driverId: item.driverId?._id,
                destinationId: item.destinationId?._id,
              })
            }
          >
            <Text style={styles.reviewButtonText}>⭐ Write Review</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No bookings found</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate("Destinations")}
              >
                <Text style={styles.exploreButtonText}>Explore Destinations</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  filterList: { maxHeight: 50, backgroundColor: "#fff", paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "#f0f0f0", marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#2196F3" },
  filterText: { color: "#666", fontSize: 13 },
  filterTextActive: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 16, padding: 16,
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  transactionId: { fontSize: 13, fontWeight: "bold", color: "#666" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  destinationName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  driverName: { fontSize: 14, color: "#666", marginTop: 4 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  dateText: { fontSize: 13, color: "#555" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  paymentBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#2196F3" },
  reviewButton: {
    backgroundColor: "#FFF8E1", borderRadius: 8, padding: 10,
    alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: "#FF9800",
  },
  reviewButtonText: { color: "#FF9800", fontWeight: "bold", fontSize: 14 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 16 },
  exploreButton: {
    backgroundColor: "#2196F3", borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 16,
  },
  exploreButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default TransactionListScreen;