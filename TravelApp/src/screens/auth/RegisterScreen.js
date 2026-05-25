import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Pick Image ────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "Images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!form.fullName.trim() || form.fullName.length < 3) {
      Alert.alert("Error", "Full name must be at least 3 characters");
      return false;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  // ─── Handle Register ───────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", form.fullName.trim());
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("password", form.password);
    if (form.phone) formData.append("phone", form.phone);

    if (profileImage) {
      const filename = profileImage.uri.split("/").pop();
      const fileType = filename.split(".").pop();
      formData.append("profileImage", {
        uri: profileImage.uri,
        name: filename,
        type: `image/${fileType}`,
      });
    }

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } else {
      Alert.alert("Registration Failed", result.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us and start exploring!</Text>

      {/* Profile Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
            <Text style={styles.imagePlaceholderLabel}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Form Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={form.fullName}
          onChangeText={(v) => updateForm("fullName", v)}
        />

        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(v) => updateForm("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={form.phone}
          onChangeText={(v) => updateForm("phone", v)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 6 characters"
          value={form.password}
          onChangeText={(v) => updateForm("password", v)}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChangeText={(v) => updateForm("confirmPassword", v)}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{" "}
            <Text style={styles.linkText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", textAlign: "center", marginTop: 16 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24 },
  imagePicker: { alignItems: "center", marginBottom: 24 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  imagePlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#e3f2fd", borderWidth: 2, borderColor: "#2196F3",
    borderStyle: "dashed", alignItems: "center", justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 32 },
  imagePlaceholderLabel: { fontSize: 12, color: "#2196F3", marginTop: 4 },
  form: {
    backgroundColor: "#fff", borderRadius: 16, padding: 24,
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 14, fontSize: 16, backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#2196F3", borderRadius: 10,
    padding: 16, alignItems: "center", marginTop: 24,
  },
  disabledButton: { backgroundColor: "#90CAF9" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loginLink: { alignItems: "center", marginTop: 20 },
  loginLinkText: { color: "#666", fontSize: 14 },
  linkText: { color: "#2196F3", fontWeight: "600" },
});

export default RegisterScreen;