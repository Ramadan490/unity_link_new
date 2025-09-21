import { RoleKey, useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Allowed tabs per role
const roleTabs: Record<RoleKey, string[]> = {
  super_admin: ["requests", "manageUsers"],
  board_member: ["requests"],
  community_member: ["requests"],
};

// Human-readable role labels
const roleLabels: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  board_member: "Board Member",
  community_member: "Community Member",
};

// Role descriptions
const roleDescriptions: Record<RoleKey, string> = {
  super_admin: "Full system access and user management",
  board_member: "Community management and moderation",
  community_member: "Basic community access and features",
};

// Role colors
const roleColors: Record<RoleKey, string> = {
  super_admin: "#FF3B30",
  board_member: "#FF9500",
  community_member: "#34C759",
};

// Tab icons
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  announcements: "megaphone-outline",
  events: "calendar-outline",
  memorials: "flower-outline",
  profile: "person-circle-outline", // 👈 whole folder is ONE tab
  requests: "document-text-outline",
  manageUsers: "people-outline",
};

export default function TabLayout() {
  const { role, setRole, user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(50);
    }
  }, [modalVisible]);

  // ✅ only these are tabs
  const baseTabs = ["index", "announcements", "events", "memorials", "profile"];
  const extraTabs = role ? roleTabs[role] ?? [] : [];
  const activeTabs = [...baseTabs, ...extraTabs];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Tabs */}
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.backgroundElevated,
            borderTopColor: theme.colors.border,
            height: Platform.OS === "ios" ? 70 : 60,
            paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          ),
        })}
      >
        {activeTabs.map((tab) => (
          <Tabs.Screen
            key={tab}
            name={tab}
            options={{
              // 👇 Translated title
              title: t(`tabs.${tab === "index" ? "home" : tab}`),
            }}
          />
        ))}
      </Tabs>

      {/* Floating Role Switcher */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: insets.bottom + 70, backgroundColor: theme.colors.primary },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="swap-horizontal" size={24} color="#fff" />
        <View
          style={[
            styles.currentRoleBadge,
            { backgroundColor: role ? roleColors[role] : "#999" },
          ]}
        >
          <Text style={styles.currentRoleText}>
            {role ? role.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Role Selector Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            style={[
              styles.modalBox,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t("roles.switchRole")}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
              {t("roles.currentUser")}: {user?.name || "Guest"}
            </Text>

            {Object.keys(roleLabels).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleButton,
                  {
                    borderLeftColor: roleColors[r as RoleKey],
                    borderLeftWidth: 4,
                    backgroundColor: role === r ? `${roleColors[r as RoleKey]}25` : "transparent",
                  },
                ]}
                onPress={() => {
                  setRole(r as RoleKey);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.roleName, { color: theme.colors.text }]}>
                  {t(`roles.${r}`)}
                </Text>
                <Text style={[styles.roleDescription, { color: theme.colors.textSecondary }]}>
                  {t(`roles.${r}Desc`)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.closeButton, { backgroundColor: theme.colors.surface2 }]}
            >
              <Text style={{ color: theme.colors.text }}>{t("buttons.close")}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  currentRoleBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  currentRoleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  roleButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  roleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    padding: 12,
    borderRadius: 10,
  },
});
