// app/settings/profile.tsx
import { ROLE_LABELS } from "@/shared/constants/Roles";
import { useRole } from "@/shared/hooks/useRole";
import { useRoleManagement } from "@/shared/hooks/useRoleManagement";
import { UserRole } from "@/shared/types/user";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

export default function SettingsProfileScreen() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useRole();
  const { users, updateUserRole } = useRoleManagement();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          {t("profile")} not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      <Text style={[styles.header, { color: isDark ? "#fff" : "#000" }]}>
        {t("profile")}
      </Text>
      <Text style={{ color: isDark ? "#ccc" : "#333" }}>
        {t("editInfo")}: {user.name}
      </Text>
      <Text style={{ color: isDark ? "#ccc" : "#333" }}>
        Email: {user.email}
      </Text>
      <Text style={{ color: isDark ? "#ccc" : "#333" }}>
        Role: {ROLE_LABELS[user.role as UserRole]}
      </Text>

      {isSuperAdmin && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: isDark ? "#fff" : "#000", marginBottom: 10 }}>
            Manage Roles:
          </Text>
          {users.map((u) => (
            <View key={u.id} style={{ marginBottom: 10 }}>
              <Text style={{ color: isDark ? "#ccc" : "#333" }}>{u.name}</Text>
              <Picker
                selectedValue={u.role}
                onValueChange={(value) =>
                  updateUserRole(u.id, value as UserRole)
                }
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ))}
              </Picker>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
