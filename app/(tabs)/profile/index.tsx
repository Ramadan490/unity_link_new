import { useAuth } from "@/shared/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Fade animation
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      t("logout"),
      t("areYouSure") || "Are you sure you want to logout?",
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)/login" as Href);
          },
        },
      ]
    );
  };

  // Language switch
  const handleSwitchLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const navigateTo = (route: Href) => router.push(route);

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: "#FF3B30",
      board_member: "#FF9500",
      community_member: "#34C759",
    };
    return colors[role as keyof typeof colors] || "#007AFF";
  };

  const themeColors = {
    background: isDark ? "#121212" : "#f5f5f5",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    border: isDark ? "#333" : "#e0e0e0",
  };

  const profileMenuItems = [
    {
      id: "edit",
      title: t("editInfo"),
      icon: "person-outline",
      route: "/profile/edit" as Href,
      color: "#007AFF",
    },
    {
      id: "appearance",
      title: t("appearance"),
      icon: "color-palette-outline",
      route: "/(tabs)/profile/appearance" as Href,
      color: "#5856D6",
    },
    {
      id: "notifications",
      title: t("notifications.title"),
      icon: "notifications-outline",
      route: "/(tabs)/profile/notifications" as Href,
      color: "#FF9500",
    },
    {
      id: "privacy",
      title: t("privacySecurity"),
      icon: "lock-closed-outline",
      route: "/(tabs)/profile/security" as Href,
      color: "#34C759",
    },
    {
      id: "help",
      title: t("helpSupport"),
      icon: "help-circle-outline",
      route: "/(tabs)/profile/help" as Href,
      color: "#FF3B30",
    },
    {
      id: "about",
      title: t("termsConditions"),
      icon: "information-circle-outline",
      route: "/(tabs)/profile/terms" as Href,
      color: "#8E8E93",
    },
  ];

  // Case: no user
  if (!user) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.centered}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={themeColors.secondaryText}
          />
          <Text style={[styles.noUserText, { color: themeColors.text }]}>
            {t("profile")}
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: "#007AFF" }]}
            onPress={() => router.push("/(auth)/login" as Href)}
          >
            <Text style={styles.loginButtonText}>{t("login")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <TouchableOpacity
            style={[
              styles.profileHeader,
              { backgroundColor: themeColors.card },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    user.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                }}
                style={styles.avatar}
              />
              <View
                style={[styles.onlineStatus, { backgroundColor: "#34C759" }]}
              />
            </View>

            <Text style={[styles.userName, { color: themeColors.text }]}>
              {user.name}
            </Text>
            <Text
              style={[styles.userEmail, { color: themeColors.secondaryText }]}
            >
              {user.email}
            </Text>

            {/* ✅ Role translated */}
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(user.role) + "20" },
              ]}
            >
              <Text
                style={[styles.userRole, { color: getRoleColor(user.role) }]}
              >
                {user.role === "super_admin"
                  ? t("roles.superAdmin")
                  : user.role === "board_member"
                    ? t("roles.boardMember")
                    : t("roles.communityMember")}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Profile Menu */}
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: themeColors.card },
            ]}
          >
            {profileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigateTo(item.route)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <Text style={[styles.menuText, { color: themeColors.text }]}>
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={themeColors.secondaryText}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Language Switch */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: themeColors.card }]}
            onPress={handleSwitchLanguage}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.logoutIconContainer,
                { backgroundColor: "#007AFF20" },
              ]}
            >
              <Ionicons name="globe-outline" size={20} color="#007AFF" />
            </View>
            <Text style={[styles.logoutText, { color: "#007AFF" }]}>
              {i18n.language === "en"
                ? t("switchToArabic")
                : t("switchToEnglish")}
            </Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: themeColors.card }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.logoutIconContainer,
                { backgroundColor: "#FF3B3020" },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.logoutText, { color: "#FF3B30" }]}>
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noUserText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  onlineStatus: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: { fontSize: 16, marginBottom: 12, textAlign: "center" },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  userRole: { fontSize: 12, fontWeight: "600" },
  menuContainer: { borderRadius: 16, marginBottom: 16 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16 },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: { flex: 1, fontSize: 16, fontWeight: "500" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
