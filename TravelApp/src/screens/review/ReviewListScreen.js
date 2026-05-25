import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import api from "../../api/axiosConfig";

import { BASE_URL } from "../../api/axiosConfig";

const ReviewListScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState("-createdAt");

  const SORT_OPTIONS = [
    { label: "Latest", value: "-createdAt" },
    { label: "Highest", value: "-ratings.overallRating" },
    { label: "Most Helpful", value: "-helpfulCount" },
  ];

  useEffect(() => {
    fetchReviews();
  }, [sort]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews?sort=${sort}`);
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
  }, [sort]);

  const handleHelpful = async (reviewId) => {
    try {
      await api.patch(`/reviews/${reviewId}/helpful`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        )
      );
    } catch (error) {
      console.log("Error:", error.message);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={{ color: star <= rating ? "#FF9800" : "#ddd", fontSize: 16 }}>
        ★
      </Text>
    ));
  };

  const renderReview = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ReviewDetail", { reviewId: item._id })}
    >
      {/* Reviewer Info */}
      <View style={styles.reviewerRow}>
        {item.userId?.profileImage ? (
          <Image
            source={{ uri: getImageUrl(item.userId.profileImage) }}
            style={styles.reviewerAvatar}
          />
        ) : (
          <View style={[styles.reviewerAvatar, styles.avatarPlaceholder]}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
        )}
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.userId?.fullName || "Anonymous"}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✅ Verified</Text>
          </View>
        )}
      </View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {renderStars(item.ratings.overallRating)}
        <Text style={styles.ratingNumber}>{item.ratings.overallRating}/5</Text>
      </View>

      {/* Review Content */}
      {item.reviewTitle && (
        <Text style={styles.reviewTitle}>{item.reviewTitle}</Text>
      )}
      <Text style={styles.reviewText} numberOfLines={3}>
        {item.reviewText}
      </Text>

      {/* Review Images */}
      {item.reviewImages?.length > 0 && (
        <FlatList
          horizontal
          data={item.reviewImages}
          keyExtractor={(_, i) => i.toString()}
          showsHorizontalScrollIndicator={false}
          style={styles.reviewImages}
          renderItem={({ item: img }) => (
            <Image
              source={{ uri: getImageUrl(img) }}
              style={styles.reviewImage}
            />
          )}
        />
      )}

      {/* Tags */}
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

      {/* Helpful Button */}
      <TouchableOpacity
        style={styles.helpfulButton}
        onPress={() => handleHelpful(item._id)}
      >
        <Text style={styles.helpfulText}>
          👍 Helpful ({item.helpfulCount})
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sort Options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.sortChip, sort === option.value && styles.sortChipActive]}
            onPress={() => { setSort(option.value); setLoading(true); }}
          >
            <Text style={[styles.sortText, sort === option.value && styles.sortTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  sortBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", padding: 12, gap: 8,
  },
  sortLabel: { fontSize: 13, color: "#666", marginRight: 4 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: "#f0f0f0",
  },
  sortChipActive: { backgroundColor: "#2196F3" },
  sortText: { fontSize: 13, color: "#666" },
  sortTextActive: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 16, elevation: 2, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  reviewerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  reviewerAvatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" },
  reviewerInfo: { flex: 1, marginLeft: 10 },
  reviewerName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  reviewDate: { fontSize: 12, color: "#999", marginTop: 2 },
  verifiedBadge: { backgroundColor: "#E8F5E9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 11, color: "#4CAF50", fontWeight: "bold" },
  starsRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ratingNumber: { fontSize: 13, color: "#FF9800", fontWeight: "bold", marginLeft: 6 },
  reviewTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  reviewText: { fontSize: 14, color: "#555", lineHeight: 21 },
  reviewImages: { marginTop: 10 },
  reviewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 6 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { backgroundColor: "#f0f0f0", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: "#666" },
  helpfulButton: {
    marginTop: 10, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: "#f0f0f0", alignItems: "flex-start",
  },
  helpfulText: { fontSize: 13, color: "#2196F3", fontWeight: "600" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 16 },
});

export default ReviewListScreen;