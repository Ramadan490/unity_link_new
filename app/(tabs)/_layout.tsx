import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import screens
import AnnouncementsScreen from "./announcements";
import EventsScreen from "./events";
import HomeScreen from "./index";
import { default as ManageUsersScreen, default as MemorialsScreen } from "./memorials";
import ProfileScreen from "./profile";
import RequestsScreen from "./requests";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  const [role, setRole] = useState<"superadmin" | "board" | "member">("member");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "bottom"]}>
      {/* ✅ Status Bar for iOS */}
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* Role Selector Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select User Role</Text>
            {["superadmin", "board", "member"].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleButton,
                  role === r && styles.roleButtonActive,
                ]}
                onPress={() => {
                  setRole(r as any);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r && styles.roleButtonTextActive,
                  ]}
                >
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ✅ Tab Navigator wrapped in SafeArea */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8e8e93",
          tabBarStyle: {
            height: 65, // taller for iOS safe area
            paddingBottom: 10, // lifts tab icons above the home bar
            paddingTop: 6,
            backgroundColor: "#fff",
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: "#ccc",
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            if (route.name === "Home") iconName = "home-outline";
            if (route.name === "Events") iconName = "calendar-outline";
            if (route.name === "Announcements") iconName = "megaphone-outline";
            if (route.name === "Memorials") iconName = "flower-outline";
            if (route.name === "Profile") iconName = "person-circle-outline";
            if (route.name === "Requests") iconName = "document-text-outline";
            if (route.name === "Manage Users") iconName = "people-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Common Tabs */}
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
        <Tab.Screen name="Memorials" component={MemorialsScreen} />

        {/* Role-Specific */}
        {role === "board" && (
          <Tab.Screen name="Requests" component={RequestsScreen} />
        )}
        {role === "superadmin" && (
          <Tab.Screen name="Manage Users" component={ManageUsersScreen} />
        )}

        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Floating Role Switcher */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#007AFF",
  },
  roleButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  fab: {
  position: "absolute",
  bottom: 120, // ~10px above your tab bar (which is 60–65 tall)
  right: 20,
  backgroundColor: "#2f4053ff",
  width: 56,
  height: 56,
  borderRadius: 28, // perfect circle
  alignItems: "center",
  justifyContent: "center",

  // Floating shadow
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 6,
}
,
});
