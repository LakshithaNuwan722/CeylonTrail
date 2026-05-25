import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import api from "../../api/axiosConfig";

const STATUS_COLORS = {
  pending: { bg: "#FFF8E1", text: "#FF9800" },
  confirmed: { bg: "#E3F2FD", text: "#2196F3" },
  completed: { bg: "#E8F5E9", text: "#4CAF50" },
  cancelled: { bg: "#FFEBEE", text: "#F44336" },
};

const AdminTransactionListScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [summary, setSummary] = useState(null);

  const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/transactions/summary"),
      ]);
      setTransactions(transRes.data.data || []);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleStatusUpdate = (transactionId, currentStatus) => {
    const nextStatuses = {
      pending: "confirmed",
      confirmed: "completed",
    };
    const nextStatus = nextStatuses[currentStatus];
    if (!nextStatus) return;

    Alert.alert(
      "Update Status",
      `Change status to "${nextStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await api.put(`/transactions/${transactionId}`, {
                bookingStatus: nextStatus,
                paymentStatus: nextStatus === "completed" ? "paid" : "pending",
              });
              fetchData();
              Alert.alert("Success", `Status updated to ${nextStatus}`);
            } catch (error) {
              Alert.alert("Error", "Failed to update status");
            }
          },
        },
      ]
    );
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.bookingStatus === filter);

  const renderTransaction = ({ item }) => {
    const statusColor = STATUS_COLORS[item.bookingStatus] || STATUS_COLORS.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.txnId}>{item.transactionId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.bookingStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>
          👤 {item.userId?.fullName || "Unknown"}
        </Text>
        <Text style={styles.destination}>
          📍 {item.destinationId?.name || "Unknown"}
        </Text>
        <Text style={styles.driver}>
          🚗 {item.driverId?.fullName || "Unknown"}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.amount}>
            ${item.pricing?.totalAmount?.toFixed(2)}
          </Text>
          <Text style={styles.paymentStatus}>
            💳 {item.paymentStatus}
          </Text>
        </View>

        {/* Update Status Button */}
        {(item.bookingStatus === "pending" || item.bookingStatus === "confirmed") && (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => handleStatusUpdate(item._id, item.bookingStatus)}
          >
            <Text style={styles.updateBtnText}>
              ➡️ Move to{" "}
              {item.bookingStatus === "pending" ? "Confirmed" : "Completed"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Revenue Summary */}
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>💰 Total Revenue</Text>
          <Text style={styles.summaryAmount}>
            ${summary.totalRevenue?.toFixed(2) || "0.00"}
          </Text>
        </View>
      )}

      {/* Filters */}
      <FlatList
        horizontal
        data={FILTERS}
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
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  summaryCard: {
    backgroundColor: "#2196F3", padding: 16,
    alignItems: "center",
  },
  summaryTitle: { color: "#E3F2FD", fontSize: 14 },
  summaryAmount: { color: "#fff", fontSize: 28, fontWeight: "bold", marginTop: 4 },
  filterList: { maxHeight: 52, backgroundColor: "#fff", paddingVertical: 8 },
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
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  txnId: { fontSize: 13, fontWeight: "bold", color: "#666" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  customerName: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 3 },
  destination: { fontSize: 13, color: "#666", marginBottom: 2 },
  driver: { fontSize: 13, color: "#666", marginBottom: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 18, fontWeight: "bold", color: "#2196F3" },
  paymentStatus: { fontSize: 13, color: "#666", textTransform: "capitalize" },
  updateBtn: {
    backgroundColor: "#E8F5E9", borderRadius: 8,
    padding: 10, alignItems: "center", marginTop: 10,
    borderWidth: 1, borderColor: "#4CAF50",
  },
  updateBtnText: { color: "#4CAF50", fontWeight: "bold", fontSize: 13 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});

export default AdminTransactionListScreen;