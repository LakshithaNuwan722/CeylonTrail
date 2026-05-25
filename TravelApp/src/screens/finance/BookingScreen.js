import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../api/axiosConfig";

const PAYMENT_METHODS = ["cash", "card", "online"];

const BookingScreen = ({ route, navigation }) => {
  const { destinationId, destinationName, driverId: preselectedDriver } = route.params || {};

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(preselectedDriver || null);
  const [selectedDestination, setSelectedDestination] = useState(destinationId || null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [totalCost, setTotalCost] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(1);

  useEffect(() => {
    fetchAvailableDrivers();
  }, []);

  useEffect(() => {
    calculateCost();
  }, [startDate, endDate, selectedDriver, drivers]);

  const fetchAvailableDrivers = async () => {
    try {
      const response = await api.get("/drivers?availability=true");
      setDrivers(response.data.data || []);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const calculateCost = () => {
    const driver = drivers.find((d) => d._id === selectedDriver);
    if (!driver) return;

    const diffTime = Math.abs(endDate - startDate);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setNumberOfDays(days);

    const subtotal = driver.vehicle.pricePerDay * days;
    const tax = subtotal * 0.1;
    setTotalCost(parseFloat((subtotal + tax).toFixed(2)));
  };

  const selectedDriverData = drivers.find((d) => d._id === selectedDriver);

  const validateForm = () => {
    if (!selectedDriver) {
      Alert.alert("Error", "Please select a driver");
      return false;
    }
    if (!selectedDestination) {
      Alert.alert("Error", "Destination is required");
      return false;
    }
    if (!pickupLocation.trim()) {
      Alert.alert("Error", "Please enter pickup location");
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert("Error", "End date must be after start date");
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await api.post("/transactions", {
        driverId: selectedDriver,
        destinationId: selectedDestination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: pickupLocation.trim(),
        paymentMethod,
        notes,
      });

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your booking has been created.\nTotal: $${totalCost}\nTransaction ID: ${response.data.data.transactionId}`,
        [
          {
            text: "View Bookings",
            onPress: () => navigation.navigate("Bookings"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>📋 Book Your Trip</Text>

      {/* Destination Info */}
      {destinationName && (
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationLabel}>📍 Destination</Text>
          <Text style={styles.destinationName}>{destinationName}</Text>
        </View>
      )}

      {/* Select Driver */}
      <Text style={styles.sectionTitle}>Select Driver</Text>
      {loadingDrivers ? (
        <ActivityIndicator color="#2196F3" />
      ) : (
        drivers.map((driver) => (
          <TouchableOpacity
            key={driver._id}
            style={[
              styles.driverOption,
              selectedDriver === driver._id && styles.driverOptionSelected,
            ]}
            onPress={() => setSelectedDriver(driver._id)}
          >
            <View style={styles.driverOptionContent}>
              <Text style={styles.driverOptionName}>{driver.fullName}</Text>
              <Text style={styles.driverOptionVehicle}>
                🚙 {driver.vehicle?.vehicleName} ({driver.vehicle?.vehicleType})
              </Text>
              <Text style={styles.driverOptionPrice}>
                💰 ${driver.vehicle?.pricePerDay}/day
              </Text>
            </View>
            {selectedDriver === driver._id && (
              <Text style={styles.checkmark}>✅</Text>
            )}
          </TouchableOpacity>
        ))
      )}

      {/* Date Selection */}
      <Text style={styles.sectionTitle}>Trip Dates</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          minimumDate={new Date(startDate.getTime() + 86400000)}
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* Pickup Location */}
      <Text style={styles.sectionTitle}>Pickup Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your pickup address"
        value={pickupLocation}
        onChangeText={setPickupLocation}
      />

      {/* Payment Method */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentOption,
              paymentMethod === method && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[
              styles.paymentOptionText,
              paymentMethod === method && styles.paymentOptionTextSelected,
            ]}>
              {method === "cash" ? "💵" : method === "card" ? "💳" : "📱"}{" "}
              {method.charAt(0).toUpperCase() + method.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Any special requests..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {/* Cost Summary */}
      {selectedDriver && (
        <View style={styles.costSummary}>
          <Text style={styles.costTitle}>💰 Cost Summary</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>
              Price per day (×{numberOfDays} days)
            </Text>
            <Text style={styles.costValue}>
              ${selectedDriverData?.vehicle?.pricePerDay} × {numberOfDays}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>
              ${(selectedDriverData?.vehicle?.pricePerDay * numberOfDays).toFixed(2)}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Tax (10%)</Text>
            <Text style={styles.costValue}>
              ${(selectedDriverData?.vehicle?.pricePerDay * numberOfDays * 0.1).toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.costRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalCost}</Text>
          </View>
        </View>
      )}

      {/* Book Button */}
      <TouchableOpacity
        style={[styles.bookButton, loading && styles.disabledButton]}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: 20 },
  destinationInfo: {
    backgroundColor: "#E3F2FD", borderRadius: 12,
    padding: 16, marginBottom: 16,
  },
  destinationLabel: { fontSize: 12, color: "#2196F3", fontWeight: "600" },
  destinationName: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 10 },
  driverOption: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 8, flexDirection: "row", alignItems: "center",
    borderWidth: 2, borderColor: "transparent",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  driverOptionSelected: { borderColor: "#2196F3", backgroundColor: "#E3F2FD" },
  driverOptionContent: { flex: 1 },
  driverOptionName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  driverOptionVehicle: { fontSize: 13, color: "#666", marginTop: 2 },
  driverOptionPrice: { fontSize: 14, color: "#4CAF50", fontWeight: "600", marginTop: 4 },
  checkmark: { fontSize: 20 },
  dateRow: { flexDirection: "row", gap: 12 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 13, color: "#666", marginBottom: 6 },
  dateButton: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, alignItems: "center",
  },
  dateButtonText: { fontSize: 14, color: "#333", fontWeight: "500" },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  paymentRow: { flexDirection: "row", gap: 8 },
  paymentOption: {
    flex: 1, backgroundColor: "#fff", borderWidth: 2,
    borderColor: "#ddd", borderRadius: 10, padding: 12, alignItems: "center",
  },
  paymentOptionSelected: { borderColor: "#2196F3", backgroundColor: "#E3F2FD" },
  paymentOptionText: { fontSize: 14, color: "#666", fontWeight: "500" },
  paymentOptionTextSelected: { color: "#2196F3", fontWeight: "bold" },
  costSummary: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, marginTop: 20,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  costTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 },
  costRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  costLabel: { fontSize: 14, color: "#666" },
  costValue: { fontSize: 14, color: "#333" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#2196F3" },
  bookButton: {
    backgroundColor: "#2196F3", borderRadius: 12,
    padding: 18, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#90CAF9" },
  bookButtonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});

export default BookingScreen;