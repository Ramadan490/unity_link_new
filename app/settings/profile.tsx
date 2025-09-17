// app/settings/profile.tsx
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { logoutUser } from "@/features/users/services/userService";
import Loading from "../../shared/components/ui/Loading";
import { Colors } from "../../shared/constants/Colors";
import { ROLE_LABELS, RoleKey } from "../../shared/constants/Roles";
import { useAuthGuard } from "../../shared/hooks/useAuthGuard";
import { useRole } from "../../shared/hooks/useRole";
import i18n from "../../shared/utils/i18n";

export default function SettingsProfileScreen() {
  useAuthGuard();

  const { t } = useTranslation();
  const { user, users, updateUserRole, isSuperAdmin } = useRole();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const switchToArabic = () => i18n.changeLanguage("ar");
  const switchToEnglish = () => i18n.changeLanguage("en");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        ⚙️ {t("settings")}
      </Text>

      {!user ? (
        <Loading message="Loading user..." />
      ) : (
        <View
          style={[
            styles.card,
            { borderColor: theme.border, backgroundColor: theme.card },
          ]}
        >
          <Text style={[styles.info, { color: theme.text }]}>
            Name: {user.name}
          </Text>
          <Text style={[styles.info, { color: theme.text }]}>
            Role: {ROLE_LABELS[user.role as RoleKey]}
          </Text>
        </View>
      )}

      {isSuperAdmin && (
        <View style={styles.manageSection}>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Manage User Roles
          </Text>
          {users.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <Text style={[styles.info, { color: theme.text }]}>{u.name}</Text>
              <Picker
                selectedValue={u.role as RoleKey}
                style={[styles.picker, { color: theme.text }]}
                onValueChange={(itemValue: RoleKey) =>
                  updateUserRole(u.id, itemValue)
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

      <View style={styles.buttons}>
        <Button
          title="Switch to Arabic"
          onPress={switchToArabic}
          color={theme.tint}
        />
        <Button
          title="Switch to English"
          onPress={switchToEnglish}
          color={theme.tint}
        />
        <Button
          title="Logout"
          onPress={async () => {
            await logoutUser();
            router.replace("/auth/login");
          }}
          color={theme.tint}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: { padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 5 },
  manageSection: { marginTop: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  userRow: { marginBottom: 15 },
  picker: { height: 40, width: 200 },
  buttons: { marginTop: 30, gap: 10 },
});
