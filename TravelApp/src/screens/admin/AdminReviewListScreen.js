import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from "react-native";
import api from "../../api/axiosConfig";

const AdminReviewListScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      setReviews(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, []);

  const handleApprove = (reviewId, currentStatus) => {
    Alert.alert(
      currentStatus ? "Reject Review" : "Approve Review",
      `${currentStatus ? "Reject" : "Approve"} this review?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await api.patch(`/reviews/${reviewId}/approve`, {
                isApproved: !currentStatus,
              });
              setReviews((prev) =>
                prev.map((r) =>
                  r._id === reviewId ? { ...r, isApproved: !currentStatus } : r
                )
              );
            } catch (error) {
              Alert.alert("Error", "Failed to update review");
            }
          },
        },
      ]
    );
  };

  const handleDelete = (reviewId) => {
    Alert.alert("Delete Review", "Permanently delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
          } catch (error) {
            Alert.alert("Error", "Failed to delete review");
          }
        },
      },
    ]);
  };

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Text key={s} style={{ color: s <= rating ? "#FF9800" : "#ddd", fontSize: 14 }}>★</Text>
    ));

  const renderReview = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.reviewerName}>
            👤 {item.userId?.fullName || "Anonymous"}
          </Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[
          styles.approvalBadge,
          { backgroundColor: item.isApproved ? "#E8F5E9" : "#FFEBEE" }
        ]}>
          <Text style={{ color: item.isApproved ? "#4CAF50" : "#F44336", fontSize: 11, fontWeight: "bold" }}>
            {item.isApproved ? "APPROVED" : "REJECTED"}
          </Text>
        </View>
      </View>

      <View style={styles.starsRow}>{renderStars(item.ratings?.overallRating)}</View>

      {item.reviewTitle && (
        <Text style={styles.reviewTitle}>{item.reviewTitle}</Text>
      )}
      <Text style={styles.reviewText} numberOfLines={3}>
        {item.reviewText}
      </Text>

      <View style={styles.tagsRow}>
        {item.driverId?.fullName && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>🚗 {item.driverId.fullName}</Text>
          </View>
        )}
        {item.destinationId?.name && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>📍 {item.destinationId.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.adminActions}>
        <TouchableOpacity
          style={[
            styles.approveBtn,
            { backgroundColor: item.isApproved ? "#FFEBEE" : "#E8F5E9" }
          ]}
          onPress={() => handleApprove(item._id, item.isApproved)}
        >
          <Text style={[
            styles.approveBtnText,
            { color: item.isApproved ? "#F44336" : "#4CAF50" }
          ]}>
            {item.isApproved ? "❌ Reject" : "✅ Approve"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          ⭐ Total Reviews: <Text style={styles.summaryCount}>{reviews.length}</Text>
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={styles.emptyText}>No reviews yet</Text>
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
    backgroundColor: "#FF9800", padding: 12, paddingHorizontal: 16,
  },
  summaryText: { color: "#FFF8E1", fontSize: 14 },
  summaryCount: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 14, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 8,
  },
  reviewerName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  reviewDate: { fontSize: 12, color: "#999", marginTop: 2 },
  approvalBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  starsRow: { flexDirection: "row", marginBottom: 6 },
  reviewTitle: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 4 },
  reviewText: { fontSize: 14, color: "#555", lineHeight: 20 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: "#666" },
  adminActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  approveBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: "center" },
  approveBtnText: { fontWeight: "bold", fontSize: 13 },
  deleteBtn: {
    backgroundColor: "#FFEBEE", borderRadius: 8,
    padding: 10, alignItems: "center", flex: 1,
  },
  deleteBtnText: { color: "#F44336", fontWeight: "bold", fontSize: 13 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});

export default AdminReviewListScreen;