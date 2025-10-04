import { updateUser as updateUserService } from "@/features/users/services/userService"; // ✅ import service
import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { useState } from "react";
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
  const { user, updateUser } = useAuth(); // context updater
  const { theme, isRTL } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t("error"), t("editProfile.emptyFields"));
      return;
    }

    try {
      if (!user?.id) throw new Error("User ID not found");

      // ✅ First update on backend
      const updated = await updateUserService(user.id, { name, email });

      // ✅ Then update in local context
      updateUser(updated);

      Alert.alert(t("success"), t("editProfile.updateSuccess"));
    } catch (err) {
      console.error("Update failed:", err);
      Alert.alert(
        t("error"),
        t("editProfile.updateError") || "Failed to update profile"
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.form}>
        {/* Name */}
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("editProfile.name")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder={t("editProfile.namePlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
        />

        {/* Email */}
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("editProfile.email")}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme.colors.border,
              color: theme.colors.text,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder={t("editProfile.emailPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
        />

        {/* Save */}
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
