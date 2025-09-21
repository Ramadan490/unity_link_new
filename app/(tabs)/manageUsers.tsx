// app/(tabs)/manage-users.tsx
import { useRole } from "@/shared/hooks/useRole";
import { useRoleManagement } from "@/shared/hooks/useRoleManagement";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define types locally since they're not available in the imported module
type UserRole = "super_admin" | "board_member" | "community_member";

interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
}

export default function ManageUsersScreen() {
  const { users, updateUserRole, loading, error, refetch } =
    useRoleManagement();
  const { isSuperAdmin } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      Alert.alert(
        "Update Failed",
        `Failed to update user role: ${errorMessage}`
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmRoleChange = (user: User, newRole: UserRole) => {
    Alert.alert(
      "Confirm Role Change",
      `Are you sure you want to change ${user.name}'s role to ${newRole.replace('_', ' ')}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => handleRoleUpdate(user.id, newRole) },
      ]
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleDisplayNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    board_member: "Board Member",
    community_member: "Community Member",
  };

  if (!isSuperAdmin) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <Ionicons name="lock-closed-outline" size={40} color="#ff3b30" />
        <Text style={[styles.permissionText, { color: isDark ? "#fff" : "#333" }]}>
          🚫 You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? "#fff" : "#2f4053" }]}>
            👥 Manage Users
          </Text>
          <Text style={[styles.subheader, { color: isDark ? "#aaa" : "#666" }]}>
            Promote or demote members of your community
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f7" }]}>
        <Ionicons name="search-outline" size={20} color={isDark ? "#aaa" : "#666"} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
          placeholder="Search users..."
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={isDark ? "#aaa" : "#666"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: isDark ? "#fff" : "#333" }]}>Loading users...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !refreshing && (
        <View style={styles.centered}>
          <Ionicons name="warning-outline" size={40} color="#ffcc00" />
          <Text style={[styles.errorText, { color: isDark ? "#fff" : "#333" }]}>
            Failed to load users: {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: "#007AFF", marginTop: 16 }]}
            onPress={refetch}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User List */}
      {!loading && !error && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#fff" : "#000"}
            />
          }
        >
          {filteredUsers.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons
                name={searchQuery ? "search-outline" : "people-outline"}
                size={48}
                color={isDark ? "#555" : "#999"}
              />
              <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
                {searchQuery ? "No users match your search" : "No users found"}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
                  updatingUserId === user.id && styles.updatingCard,
                ]}
              >
                <View style={styles.userInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <View style={styles.userDetails}>
                    <Text
                      style={[styles.userName, { color: isDark ? "#fff" : "#333" }]}
                      numberOfLines={1}
                    >
                      {user.name}
                    </Text>
                    {user.email && (
                      <Text
                        style={[styles.userEmail, { color: isDark ? "#bbb" : "#666" }]}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    )}
                    <View style={styles.roleContainer}>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: getRoleColor(user.role, isDark) },
                        ]}
                      >
                        <Text style={styles.roleText}>
                          {roleDisplayNames[user.role]}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  {user.role !== "board_member" && (
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        { backgroundColor: "#34C759" },
                        updatingUserId === user.id && styles.buttonDisabled,
                      ]}
                      onPress={() => confirmRoleChange(user, "board_member")}
                      disabled={updatingUserId !== null}
                    >
                      {updatingUserId === user.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Make Board</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {user.role !== "community_member" && (
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        { backgroundColor: "#007AFF" },
                        updatingUserId === user.id && styles.buttonDisabled,
                      ]}
                      onPress={() => confirmRoleChange(user, "community_member")}
                      disabled={updatingUserId !== null}
                    >
                      {updatingUserId === user.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Make Member</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// Helper function to get role-specific colors
const getRoleColor = (role: UserRole, isDark: boolean): string => {
  const colors: Record<UserRole, string> = {
    super_admin: isDark ? "#5856d6" : "#5856d6",
    board_member: isDark ? "#34C759" : "#34C759",
    community_member: isDark ? "#007AFF" : "#007AFF",
  };
  return colors[role] || (isDark ? "#555" : "#ddd");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  subheader: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  updatingCard: {
    opacity: 0.7,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: "row",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 110,
    alignItems: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
});