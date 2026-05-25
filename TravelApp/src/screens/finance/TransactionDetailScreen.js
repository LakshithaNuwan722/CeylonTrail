import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";
import { BASE_URL } from "../../api/axiosConfig";

const STATUS_COLORS = {
  pending: "#FF9800",
  confirmed: "#2196F3",
  completed: "#4CAF50",
  cancelled: "#F44336",
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const TransactionDetailScreen = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, []);

  // ─── Fetch Transaction ────────────────────────────────────────────────────
  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      setTransaction(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load booking details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // ─── Cancel Booking ───────────────────────────────────────────────────────
  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/transactions/${transactionId}`);
              Alert.alert(
                "Booking Cancelled",
                "Your booking has been cancelled.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to cancel booking"
              );
            }
          },
        },
      ]
    );
  };

  // ─── Upload Receipt ───────────────────────────────────────────────────────
  const handleUploadReceipt = async () => {
    try {
      // ── Request permission ─────────────────────────────────────────────
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload receipt"
        );
        return;
      }

      // ── Open image picker ──────────────────────────────────────────────
      const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      quality: 0.8,
    });

      // ── User cancelled picker ──────────────────────────────────────────
      if (result.canceled) {
        return;
      }

      // ── Start uploading ────────────────────────────────────────────────
      setUploadingReceipt(true);

      const imageAsset = result.assets[0];
      const filename = imageAsset.uri.split("/").pop();
      const fileType = filename.split(".").pop();

      // ── Build form data ────────────────────────────────────────────────
      const formData = new FormData();
      formData.append("receiptImage", {
        uri: imageAsset.uri,
        name: filename,
        type: `image/${fileType}`,
      });

      // ── Send to backend ────────────────────────────────────────────────
      const response = await api.patch(
        `/transactions/${transactionId}/receipt`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ── Update local state with new data ───────────────────────────────
      setTransaction(response.data.data);

      Alert.alert(
        "Success! 🎉",
        "Receipt uploaded successfully"
      );
    } catch (error) {
      console.log("Receipt upload error:", error.message);
      Alert.alert(
        "Upload Failed",
        error.response?.data?.message ||
          "Failed to upload receipt. Please try again."
      );
    } finally {
      setUploadingReceipt(false);
    }
  };

  // ─── Get full image URL ───────────────────────────────────────────────────
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}/${path}`;
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  const t = transaction;
  const statusColor = STATUS_COLORS[t?.bookingStatus] || "#999";

  return (
    <ScrollView style={styles.container}>
      {/* ── Status Header ────────────────────────────────────────────────── */}
      <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
        <Text style={styles.transactionId}>{t?.transactionId}</Text>
        <Text style={styles.statusLabel}>
          {t?.bookingStatus?.toUpperCase()}
        </Text>
        <Text style={styles.totalAmount}>
          ${t?.pricing?.totalAmount?.toFixed(2)}
        </Text>
      </View>

      <View style={styles.content}>
        {/* ── Trip Information ──────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗺️ Trip Information</Text>
          <InfoRow
            label="📍 Destination"
            value={t?.destinationId?.name || "N/A"}
          />
          <InfoRow
            label="📅 Start Date"
            value={new Date(t?.tripDetails?.startDate).toLocaleDateString()}
          />
          <InfoRow
            label="📅 End Date"
            value={new Date(t?.tripDetails?.endDate).toLocaleDateString()}
          />
          <InfoRow
            label="🌙 Duration"
            value={`${t?.tripDetails?.numberOfDays} day(s)`}
          />
          <InfoRow
            label="📌 Pickup"
            value={t?.tripDetails?.pickupLocation}
          />
        </View>

        {/* ── Driver Information ────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Driver Information</Text>
          <InfoRow
            label="👤 Driver"
            value={t?.driverId?.fullName || "N/A"}
          />
          <InfoRow
            label="🚙 Vehicle"
            value={t?.driverId?.vehicle?.vehicleName || "N/A"}
          />
          <InfoRow
            label="📱 Phone"
            value={t?.driverId?.phone || "N/A"}
          />
        </View>

        {/* ── Payment Details ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Payment Details</Text>
          <InfoRow
            label="💳 Method"
            value={t?.paymentMethod?.toUpperCase()}
          />
          <InfoRow
            label="💵 Price/Day"
            value={`$${t?.pricing?.pricePerDay}`}
          />
          <InfoRow
            label="📊 Subtotal"
            value={`$${t?.pricing?.subtotal?.toFixed(2)}`}
          />
          <InfoRow
            label="🧾 Tax (10%)"
            value={`$${t?.pricing?.tax?.toFixed(2)}`}
          />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>💰 Total</Text>
            <Text style={styles.totalValue}>
              ${t?.pricing?.totalAmount?.toFixed(2)}
            </Text>
          </View>

          {/* Payment Status Badge */}
          <View
            style={[
              styles.paymentStatusBadge,
              {
                backgroundColor:
                  t?.paymentStatus === "paid" ? "#E8F5E9" : "#FFF8E1",
              },
            ]}
          >
            <Text
              style={{
                color:
                  t?.paymentStatus === "paid" ? "#4CAF50" : "#FF9800",
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 14,
              }}
            >
              Payment: {t?.paymentStatus?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ── Notes ────────────────────────────────────────────────────── */}
        {t?.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📝 Notes</Text>
            <Text style={styles.notesText}>{t.notes}</Text>
          </View>
        )}

        {/* ── Receipt Section ───────────────────────────────────────────── */}
        {t?.bookingStatus !== "cancelled" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧾 Payment Receipt</Text>

            {/* Show receipt image if exists */}
            {t?.receiptImage ? (
              <View style={styles.receiptContainer}>
                <Image
                  source={{ uri: getImageUrl(t.receiptImage) }}
                  style={styles.receiptImage}
                  resizeMode="cover"
                />
                <Text style={styles.receiptUploadedText}>
                  ✅ Receipt uploaded
                </Text>
              </View>
            ) : (
              <View style={styles.noReceiptContainer}>
                <Text style={styles.noReceiptEmoji}>📄</Text>
                <Text style={styles.noReceiptText}>
                  No receipt uploaded yet
                </Text>
                <Text style={styles.noReceiptSub}>
                  Upload your payment receipt below
                </Text>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                uploadingReceipt && styles.uploadButtonDisabled,
              ]}
              onPress={handleUploadReceipt}
              disabled={uploadingReceipt}
            >
              {uploadingReceipt ? (
                <View style={styles.uploadingRow}>
                  <ActivityIndicator
                    color="#fff"
                    size="small"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.uploadButtonText}>
                    Uploading...
                  </Text>
                </View>
              ) : (
                <Text style={styles.uploadButtonText}>
                  {t?.receiptImage
                    ? "📤 Update Receipt"
                    : "📤 Upload Receipt"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Write Review Button (completed trips) ─────────────────────── */}
        {t?.bookingStatus === "completed" && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate("AddReview", {
                transactionId: t._id,
                driverId: t.driverId?._id,
                destinationId: t.destinationId?._id,
              })
            }
          >
            <Text style={styles.reviewButtonText}>
              ⭐ Write a Review
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Cancel Button (pending only) ──────────────────────────────── */}
        {t?.bookingStatus === "pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>❌ Cancel Booking</Text>
          </TouchableOpacity>
        )}
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
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  statusHeader: {
    padding: 28,
    alignItems: "center",
  },
  transactionId: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  statusLabel: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  totalAmount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 8,
  },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2196F3",
  },
  paymentStatusBadge: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  notesText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  receiptContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  receiptUploadedText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  noReceiptContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noReceiptEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  noReceiptText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  noReceiptSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewButton: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F44336",
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  cancelButtonText: {
    color: "#F44336",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default TransactionDetailScreen;