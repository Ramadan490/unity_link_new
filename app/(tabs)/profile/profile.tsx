import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IoniconName = keyof typeof Ionicons.glyphMap;

const Colors = {
  light: {
    text: "#000",
    background: "#fff",
    tint: "#007AFF",
    card: "#f8f9fa",
    secondaryText: "#6c757d",
    border: "#dee2e6",
  },
  dark: {
    text: "#fff",
    background: "#121212",
    tint: "#0A84FF",
    card: "#1e1e1e",
    secondaryText: "#a0a0a0",
    border: "#2c2c2c",
  },
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() || "light";
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [user] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    unit: "Unit 205",
    joinDate: "January 2022",
    role: "Board Member",
    avatar: null,
  });

  const menuItems: { icon: IoniconName; label: string; action: () => void; color?: string }[] = [
    { icon: "lock-closed", label: "Privacy & Security", action: () => router.push("/(tabs)/profile/security" as Href) },
    { icon: "notifications", label: "Notifications", action: () => router.push("/(tabs)/profile/notifications" as Href) },
    { icon: "help-circle", label: "Help & Support", action: () => router.push("/(tabs)/profile/help" as Href) },
    { icon: "document-text", label: "Terms & Conditions", action: () => router.push("/(tabs)/profile/terms" as Href) },
    {
      icon: "globe",
      label: i18n.language === "en" ? t("switchToArabic") || "Switch to Arabic" : t("switchToEnglish") || "Switch to English",
      action: () => i18n.changeLanguage(i18n.language === "en" ? "ar" : "en"),
    },
    { icon: "log-out", label: "Log Out", action: () => console.log("Logout"), color: "#ff3b30" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("profile")}</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => console.log("Change Avatar")}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
                <Text style={[styles.avatarText, { color: colors.background }]}>
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.secondaryText }]}>{user.email}</Text>

          {/* Role Chip */}
          <View style={[styles.roleChip, { backgroundColor: colors.tint + "20" }]}>
            <Ionicons name="star" size={14} color={colors.tint} />
            <Text style={[styles.roleText, { color: colors.tint }]}>{user.role}</Text>
          </View>

          {/* User Details */}
          <View style={styles.userDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="business" size={16} color={colors.secondaryText} />
              <Text style={[styles.detailText, { color: colors.secondaryText }]}>{user.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={colors.secondaryText} />
              <Text style={[styles.detailText, { color: colors.secondaryText }]}>{t("memberSince")} {user.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Menu Section */}
        <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>Account Settings</Text>
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={item.action}
              accessibilityLabel={`Go to ${item.label}`}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color={item.color || colors.tint} />
              <Text style={[styles.menuLabel, { color: item.color || colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} style={styles.menuArrow} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.versionText, { color: colors.secondaryText }]}>Community App v1.0.0 (Build 101)</Text>
          <Text style={[styles.copyrightText, { color: colors.secondaryText }]}>
            © {new Date().getFullYear()} Community Management • Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: "700" },

  profileCard: {
    margin: 20,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: { marginBottom: 15, position: "relative" },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "700" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: { fontSize: 22, fontWeight: "600", marginBottom: 4 },
  userEmail: { fontSize: 15, marginBottom: 10 },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  roleText: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  userDetails: { width: "100%", marginTop: 10 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailText: { marginLeft: 8, fontSize: 14 },

  sectionHeader: { fontSize: 14, fontWeight: "600", marginLeft: 20, marginBottom: 8, textTransform: "uppercase" },
  menuSection: { marginHorizontal: 20, marginBottom: 20 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: { flex: 1, fontSize: 16, marginLeft: 12 },
  menuArrow: { marginLeft: "auto" },

  footer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  versionText: { fontSize: 14, marginBottom: 4 },
  copyrightText: { fontSize: 12 },
});
