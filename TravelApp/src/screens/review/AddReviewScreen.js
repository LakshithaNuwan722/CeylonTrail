import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/axiosConfig";

const StarRating = ({ label, value, onChange }) => {
  return (
    <View style={starStyles.container}>
      <Text style={starStyles.label}>{label}</Text>
      <View style={starStyles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[starStyles.star, star <= value && starStyles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const starStyles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  stars: { flexDirection: "row" },
  star: { fontSize: 36, color: "#ddd", marginRight: 4 },
  starActive: { color: "#FF9800" },
});

const AddReviewScreen = ({ route, navigation }) => {
  const { transactionId, driverId, destinationId } = route.params;
  const [ratings, setRatings] = useState({
    overallRating: 0,
    driverRating: 0,
    destinationRating: 0,
    valueForMoney: 0,
  });
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateRating = (field, value) =>
    setRatings((prev) => ({ ...prev, [field]: value }));

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images", mediaTypes: "Images", 
    allowsMultipleSelection: true,
    quality: 0.8,
  });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 4));
    }
  };

  const validateForm = () => {
    if (ratings.overallRating === 0) {
      Alert.alert("Error", "Please provide an overall rating");
      return false;
    }
    if (!reviewText.trim() || reviewText.length < 10) {
      Alert.alert("Error", "Review must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("transactionId", transactionId);
      formData.append("driverId", driverId);
      if (destinationId) formData.append("destinationId", destinationId);
      formData.append("overallRating", ratings.overallRating);
      formData.append("driverRating", ratings.driverRating);
      formData.append("destinationRating", ratings.destinationRating);
      formData.append("valueForMoney", ratings.valueForMoney);
      if (reviewTitle) formData.append("reviewTitle", reviewTitle);
      formData.append("reviewText", reviewText);

      images.forEach((img) => {
        const filename = img.uri.split("/").pop();
        const fileType = filename.split(".").pop();
        formData.append("reviewImages", {
          uri: img.uri, name: filename, type: `image/${fileType}`,
        });
      });

      await api.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Thank You! ⭐", "Your review has been submitted.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Write a Review</Text>

      {/* Star Ratings */}
      <View style={styles.ratingsCard}>
        <StarRating
          label="⭐ Overall Experience *"
          value={ratings.overallRating}
          onChange={(v) => updateRating("overallRating", v)}
        />
        <StarRating
          label="🚗 Driver Rating"
          value={ratings.driverRating}
          onChange={(v) => updateRating("driverRating", v)}
        />
        <StarRating
          label="🌍 Destination Rating"
          value={ratings.destinationRating}
          onChange={(v) => updateRating("destinationRating", v)}
        />
        <StarRating
          label="💰 Value for Money"
          value={ratings.valueForMoney}
          onChange={(v) => updateRating("valueForMoney", v)}
        />
      </View>

      {/* Review Title */}
      <Text style={styles.label}>Review Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Summarize your experience"
        value={reviewTitle}
        onChangeText={setReviewTitle}
      />

      {/* Review Text */}
      <Text style={styles.label}>Your Review *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell us about your experience (minimum 10 characters)"
        value={reviewText}
        onChangeText={setReviewText}
        multiline
        numberOfLines={5}
      />
      <Text style={styles.charCount}>{reviewText.length} characters</Text>

      {/* Add Photos */}
      <Text style={styles.label}>Add Photos (Optional)</Text>
      <TouchableOpacity style={styles.photoPicker} onPress={pickImages}>
        <Text style={styles.photoPickerText}>📷 Add Trip Photos</Text>
        <Text style={styles.photoPickerSub}>{images.length}/4 selected</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImages((prev) => prev.filter((_, i) => i !== index))}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  ratingsCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 16,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  charCount: { fontSize: 12, color: "#999", textAlign: "right", marginTop: 4 },
  photoPicker: {
    backgroundColor: "#E3F2FD", borderRadius: 12, borderWidth: 2,
    borderColor: "#2196F3", borderStyle: "dashed",
    padding: 16, alignItems: "center",
  },
  photoPickerText: { fontSize: 15, color: "#2196F3", fontWeight: "600" },
  photoPickerSub: { fontSize: 12, color: "#90CAF9", marginTop: 4 },
  imagePreview: { marginTop: 12 },
  imageContainer: { position: "relative", marginRight: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImage: {
    position: "absolute", top: -6, right: -6,
    backgroundColor: "#F44336", borderRadius: 10,
    width: 20, height: 20, justifyContent: "center", alignItems: "center",
  },
  removeImageText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  submitButton: {
    backgroundColor: "#FF9800", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#FFCC80" },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AddReviewScreen;