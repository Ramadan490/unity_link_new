// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Import the useAuth hook
import { RoleKey, useAuth } from "@/context/AuthContext";

// Screens
import AnnouncementsScreen from "./announcements";
import EventsScreen from "./events";
import HomeScreen from "./index";
import ManageUsersScreen from "./manageUsers";
import MemorialsScreen from "./memorials";
import ProfileScreen from "./profile";
import RequestsScreen from "./requests";

const Tab = createBottomTabNavigator();

// Define the tab structure for each role
interface TabConfig {
  name: string;
  component: React.ComponentType<any>;
}

const roleTabs: Record<RoleKey, TabConfig[]> = {
  super_admin: [
    { name: "Requests", component: RequestsScreen },
    { name: "Manage Users", component: ManageUsersScreen },
  ],
  board_member: [{ name: "Requests", component: RequestsScreen }],
  community_member: [],
  member: [],
};

export default function TabsLayout() {
  const { role, setRole } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    Home: "home-outline",
    Events: "calendar-outline",
    Announcements: "megaphone-outline",
    Memorials: "flower-outline",
    Requests: "document-text-outline",
    "Manage Users": "people-outline",
    Profile: "person-circle-outline",
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Role Selector Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: isDark ? "#fff" : "#333" }]}
            >
              Select User Role
            </Text>
            {(["super_admin", "board_member", "community_member", "member"] as RoleKey[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleButton,
                  role === r && styles.roleButtonActive,
                ]}
                onPress={() => {
                  setRole(r);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r && styles.roleButtonTextActive,
                  ]}
                >
                  {r.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8e8e93",
          tabBarLabelStyle: { fontSize: 12, marginBottom: 2 },
          tabBarStyle: {
            height: 72,
            paddingBottom: 8,
            paddingTop: 6,
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 6,
            elevation: 8,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconMap[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
        <Tab.Screen name="Memorials" component={MemorialsScreen} />
        {roleTabs[role].map((t) => (
          <Tab.Screen key={t.name} name={t.name} component={t.component} />
        ))}
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Floating Role Switcher */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom: insets.bottom + 90,
            backgroundColor: isDark ? "#0A84FF" : "#007AFF",
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="swap-horizontal-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    padding: 20,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  roleButtonActive: { backgroundColor: "#007AFF" },
  roleButtonText: { fontSize: 16, color: "#007AFF", fontWeight: "500" },
  roleButtonTextActive: { color: "#fff" },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
});