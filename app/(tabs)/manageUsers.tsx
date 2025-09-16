// app/(tabs)/manage-users.tsx
import { useRole } from "@/hooks/useRole";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ManageUsersScreen() {
  const { users, updateUserRole, loading, error, refetch } = useRoleManagement();
  const { isSuperAdmin } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  if (!isSuperAdmin) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={40} color="#ff3b30" />
        <Text style={styles.permissionText}>
          🚫 You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={40} color="#ffcc00" />
        <Text style={styles.errorText}>Failed to load users: {error}</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#007AFF", marginTop: 16 }]}
          onPress={refetch}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 20, backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.header, { color: isDark ? "#fff" : "#2f4053" }]}>
            👥 Manage Users
          </Text>
          <Text style={[styles.subheader, { color: isDark ? "#aaa" : "#666" }]}>
            Promote or demote members of your community
          </Text>
        </View>
      </View>

      {/* User list */}
      {users.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={48} color={isDark ? "#555" : "#999"} />
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            No users found.
          </Text>
        </View>
      ) : (
        users.map((u) => (
          <View
            key={u.id}
            style={[
              styles.userCard,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <View style={styles.userInfo}>
              <Ionicons
                name="person-circle-outline"
                size={40}
                color={isDark ? "#0A84FF" : "#007AFF"}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.userName, { color: isDark ? "#fff" : "#333" }]}>
                  {u.name}
                </Text>
                <Text style={[styles.userRole, { color: isDark ? "#bbb" : "#666" }]}>
                  {u.role}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#34C759" }]}
                onPress={() => updateUserRole(u.id, "board_member")}
              >
                <Text style={styles.buttonText}>Make Board</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#007AFF" }]}
                onPress={() => updateUserRole(u.id, "community_member")}
              >
                <Text style={styles.buttonText}>Make Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: { fontSize: 26, fontWeight: "800" },
  subheader: { fontSize: 14, marginTop: 4 },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  userName: { fontSize: 16, fontWeight: "600" },
  userRole: { fontSize: 13 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: { marginTop: 12, fontSize: 16, color: "#333", textAlign: "center" },
  loadingText: { marginTop: 10, fontSize: 14 },
  errorText: { marginTop: 12, fontSize: 14, textAlign: "center" },
  emptyText: { marginTop: 8, fontSize: 14 },
});
