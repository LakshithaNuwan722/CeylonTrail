import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

const AdminLoginScreen = ({ navigation }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    const result = await adminLogin(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Login Failed", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🛡️</Text>
        <Text style={styles.title}>Admin Portal</Text>
        <Text style={styles.subtitle}>Travel App Administration</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Admin Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@travelapp.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter admin password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Admin Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to User Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a237e" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  emoji: { fontSize: 64, textAlign: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#9FA8DA", textAlign: "center", marginBottom: 32 },
  form: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 14, fontSize: 16, backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#1a237e", borderRadius: 10,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#7986CB" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backButton: { alignItems: "center", marginTop: 16 },
  backButtonText: { color: "#666", fontSize: 14 },
});

export default AdminLoginScreen;