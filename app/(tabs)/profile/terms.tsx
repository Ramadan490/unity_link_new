import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    console.log("✅ Terms Accepted");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Text style={styles.header}>📄 Terms & Conditions</Text>
      <Text style={styles.subheader}>
        Please read these carefully before using the app.
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          By accessing or using this application, you agree to be bound by these
          Terms & Conditions. If you do not agree, please do not use the app.
        </Text>
        {/* ... more sections ... */}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkbox, accepted && styles.checkboxChecked]}
          onPress={() => setAccepted(!accepted)}
        >
          {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>
          I agree to the Terms & Conditions
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { opacity: accepted ? 1 : 0.5 }]}
        onPress={handleAccept}
        disabled={!accepted}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: "#2f4053",
  },
  subheader: { fontSize: 14, color: "#666", marginBottom: 20 },
  scroll: { flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: { fontSize: 14, lineHeight: 20, color: "#444" },
  footer: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  checkboxLabel: { fontSize: 14, color: "#333" },
  button: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
