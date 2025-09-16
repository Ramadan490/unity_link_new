import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Redirect to Change Password screen.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.header}>🔒 Privacy & Security</Text>
        <Text style={styles.subheader}>
          Manage your account security and privacy preferences.
        </Text>

        {/* Authentication Section */}
        <Text style={styles.sectionTitle}>Login & Authentication</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="finger-print-outline" size={22} color="#007AFF" />
            <Text style={styles.label}>Biometric Login</Text>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              thumbColor={Platform.OS === "android" ? (biometric ? "#007AFF" : "#ccc") : undefined}
              trackColor={{ false: "#ddd", true: "#81b0ff" }}
              accessibilityLabel="Toggle biometric login"
            />
          </View>

          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#007AFF" />
            <Text style={styles.label}>Two-Factor Authentication</Text>
            <Switch
              value={twoFA}
              onValueChange={setTwoFA}
              thumbColor={Platform.OS === "android" ? (twoFA ? "#007AFF" : "#ccc") : undefined}
              trackColor={{ false: "#ddd", true: "#81b0ff" }}
              accessibilityLabel="Toggle two-factor authentication"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <View style={styles.rowNoBorder}>
            <Ionicons name="person-outline" size={22} color="#007AFF" />
            <Text style={styles.label}>Allow Data Sharing</Text>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              thumbColor={Platform.OS === "android" ? (dataSharing ? "#007AFF" : "#ccc") : undefined}
              trackColor={{ false: "#ddd", true: "#81b0ff" }}
              accessibilityLabel="Toggle data sharing"
            />
          </View>
        </View>

        {/* Change Password */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          accessibilityLabel="Change your password"
        >
          <Ionicons name="key-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 6, color: "#2f4053" },
  subheader: { fontSize: 14, color: "#666", marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#444" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  rowNoBorder: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  label: { flex: 1, marginLeft: 12, fontSize: 16, color: "#333" },
  button: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
