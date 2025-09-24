import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { theme, isRTL } = useTheme();
  const { t } = useTranslation();

  // Local state for editing
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t("error"), t("editProfile.emptyFields"));
      return;
    }

    // ✅ Update global user + storage
    updateUser({ name, email });

    Alert.alert(t("success"), t("editProfile.updateSuccess"));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.form}>
        {/* Name field */}
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("editProfile.name")}
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: theme.colors.border, 
              color: theme.colors.text,
              textAlign: isRTL ? "right" : "left"
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder={t("editProfile.namePlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
        />

        {/* Email field */}
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("editProfile.email")}
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: theme.colors.border, 
              color: theme.colors.text,
              textAlign: isRTL ? "right" : "left"
            },
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder={t("editProfile.emailPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
        />

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>{t("save")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});