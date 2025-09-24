// app/(tabs)/manageUsers.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { useRoleManagement } from "@/shared/hooks/useRoleManagement";
import { User, UserRole } from "@/shared/types/user";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

export default function ManageUsersScreen() {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const { users, updateUserRole, loading, error, refetch } =
    useRoleManagement();
  const { isSuperAdmin } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    UserRole | "all"
  >("all");

  // Debug log
  useEffect(() => {
    console.log("=== ManageUsers Debug Info ===");
    console.log("Users:", users);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("isSuperAdmin:", isSuperAdmin);
    console.log("=============================");
  }, [users, loading, error, isSuperAdmin]);

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    if (!userId) return;
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      console.error("Role update failed:", err);
      Alert.alert(t("error"), t("manageUsers.roleUpdateFailed"));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmRoleChange = (user: User, newRole: UserRole) => {
    const action = newRole === "community_member" ? "demote" : "promote";
    const roleName = roleDisplayNames[newRole];
    const currentRoleName = roleDisplayNames[user.role];

    Alert.alert(
      t("manageUsers.changeRole"),
      t("manageUsers.confirmRoleChange", {
        userName: user.name,
        currentRole: currentRoleName,
        newRole: roleName,
      }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          style: action === "demote" ? "destructive" : "default",
          onPress: () => handleRoleUpdate(user.id, newRole),
        },
      ],
    );
  };

  const filteredUsers = useMemo(() => {
    let result = safeUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (selectedRoleFilter !== "all") {
      result = result.filter((user) => user.role === selectedRoleFilter);
    }

    return result.sort((a, b) => {
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return roleOrder[a.role] - roleOrder[b.role];
      }
      return a.name.localeCompare(b.name);
    });
  }, [safeUsers, searchQuery, selectedRoleFilter]);

  const roleFilters: { key: UserRole | "all"; label: string; count: number }[] =
    [
      { key: "all", label: t("manageUsers.filters.all"), count: safeUsers.length },
      {
        key: "super_admin",
        label: t("manageUsers.filters.admins"),
        count: safeUsers.filter((u) => u.role === "super_admin").length,
      },
      {
        key: "board_member",
        label: t("manageUsers.filters.board"),
        count: safeUsers.filter((u) => u.role === "board_member").length,
      },
      {
        key: "community_member",
        label: t("manageUsers.filters.members"),
        count: safeUsers.filter((u) => u.role === "community_member").length,
      },
    ];

  if (!isSuperAdmin) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#000" : "#f8f9fa" },
        ]}
      >
        <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isDark ? "#1c1c1e" : "#e9ecef" },
            ]}
          >
            <Ionicons
              name="shield-outline"
              size={48}
              color={isDark ? "#666" : "#999"}
            />
          </View>
          <Text
            style={[
              styles.permissionTitle,
              { color: isDark ? "#fff" : "#333" },
            ]}
          >
            {t("manageUsers.accessRestricted")}
          </Text>
          <Text
            style={[styles.permissionText, { color: isDark ? "#ccc" : "#666" }]}
          >
            {t("manageUsers.superAdminRequired")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f8f9fa" },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            {t("manageUsers.title")}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#ccc" : "#666" }]}>
            {t("manageUsers.subtitle", { count: safeUsers.length })}
          </Text>
        </View>
      </View>

      {/* Search + Filters */}
      <View style={styles.controlsContainer}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
          ]}
        >
          <Ionicons name="search" size={20} color={isDark ? "#999" : "#666"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
            placeholder={t("manageUsers.searchPlaceholder")}
            placeholderTextColor={isDark ? "#666" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? "#666" : "#999"}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {roleFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    selectedRoleFilter === filter.key
                      ? getRoleColor(filter.key, isDark)
                      : "transparent",
                  borderColor:
                    selectedRoleFilter === filter.key
                      ? getRoleColor(filter.key, isDark)
                      : isDark
                        ? "#333"
                        : "#ddd",
                },
              ]}
              onPress={() => setSelectedRoleFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedRoleFilter === filter.key
                        ? "#fff"
                        : isDark
                          ? "#ccc"
                          : "#666",
                    fontWeight:
                      selectedRoleFilter === filter.key ? "700" : "500",
                  },
                ]}
              >
                {filter.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor:
                      selectedRoleFilter === filter.key
                        ? "rgba(255,255,255,0.2)"
                        : isDark
                          ? "#333"
                          : "#e9ecef",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    {
                      color:
                        selectedRoleFilter === filter.key
                          ? "#fff"
                          : isDark
                            ? "#999"
                            : "#666",
                    },
                  ]}
                >
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text
              style={[styles.loadingText, { color: isDark ? "#ccc" : "#666" }]}
            >
              {t("manageUsers.loading")}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isDark ? "#1c1c1e" : "#e9ecef" },
              ]}
            >
              <Ionicons name="warning-outline" size={48} color="#ff9500" />
            </View>
            <Text
              style={[styles.errorText, { color: isDark ? "#fff" : "#000" }]}
            >
              {t("manageUsers.loadFailed")}
            </Text>
            <Text
              style={[styles.errorSubtext, { color: isDark ? "#ccc" : "#666" }]}
            >
              {typeof error === "string"
                ? error
                : t("manageUsers.checkConnection")}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>{t("tryAgain")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#fff" : "#000"}
              />
            }
          >
            {(searchQuery || selectedRoleFilter !== "all") &&
              filteredUsers.length > 0 && (
                <View style={styles.resultsInfo}>
                  <View style={styles.resultsTextContainer}>
                    <Text
                      style={[
                        styles.resultsText,
                        { color: isDark ? "#ccc" : "#666" },
                      ]}
                    >
                      {t("manageUsers.usersFound", { count: filteredUsers.length })}
                    </Text>
                    {searchQuery && (
                      <Text
                        style={[
                          styles.searchQueryText,
                          { color: isDark ? "#999" : "#888" },
                        ]}
                      >
                        {t("manageUsers.searchFor", { query: searchQuery })}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSearchQuery("");
                      setSelectedRoleFilter("all");
                    }}
                  >
                    <Text
                      style={{
                        color: "#007AFF",
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      {t("manageUsers.clearAll")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isDark ? "#1c1c1e" : "#e9ecef" },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={isDark ? "#666" : "#999"}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {searchQuery || selectedRoleFilter !== "all"
                    ? t("manageUsers.noUsersFound")
                    : t("manageUsers.noUsersAvailable")}
                </Text>
                <Text
                  style={[
                    styles.emptyText,
                    { color: isDark ? "#ccc" : "#666" },
                  ]}
                >
                  {searchQuery
                    ? t("manageUsers.adjustSearchTerms")
                    : selectedRoleFilter !== "all"
                      ? t("manageUsers.noFilteredUsers", { 
                          role: roleFilters.find((f) => f.key === selectedRoleFilter)?.label.toLowerCase() 
                        })
                      : t("manageUsers.noUsersInCommunity")}
                </Text>
                {(searchQuery || selectedRoleFilter !== "all") && (
                  <TouchableOpacity
                    style={[styles.clearButton, styles.clearAllButton]}
                    onPress={() => {
                      setSearchQuery("");
                      setSelectedRoleFilter("all");
                    }}
                  >
                    <Text style={{ color: "#007AFF", fontWeight: "600" }}>
                      {t("manageUsers.clearFilters")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredUsers.map((user) => (
                <View
                  key={user.id}
                  style={[
                    styles.userCard,
                    {
                      backgroundColor: isDark ? "#1c1c1e" : "#fff",
                      borderLeftWidth: 4,
                      borderLeftColor: getRoleColor(user.role, isDark),
                    },
                  ]}
                >
                  <View style={styles.userMain}>
                    <View style={styles.userInfo}>
                      <View
                        style={[
                          styles.avatarContainer,
                          {
                            backgroundColor:
                              getRoleColor(user.role, isDark) + "20",
                          },
                        ]}
                      >
                        <Ionicons
                          name={getRoleIcon(user.role)}
                          size={24}
                          color={getRoleColor(user.role, isDark)}
                        />
                      </View>
                      <View style={styles.userDetails}>
                        <Text
                          style={[
                            styles.userName,
                            { color: isDark ? "#fff" : "#000" },
                          ]}
                        >
                          {user.name}
                        </Text>
                        <Text
                          style={[
                            styles.userEmail,
                            { color: isDark ? "#999" : "#666" },
                          ]}
                        >
                          {user.email}
                        </Text>
                        <View
                          style={[
                            styles.roleBadge,
                            {
                              backgroundColor: getRoleColor(user.role, isDark),
                            },
                          ]}
                        >
                          <Ionicons
                            name={getRoleIcon(user.role)}
                            size={12}
                            color="#fff"
                            style={styles.roleIcon}
                          />
                          <Text style={styles.roleText}>
                            {roleDisplayNames[user.role]}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {updatingUserId === user.id ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <View style={styles.actions}>
                        {user.role !== "super_admin" && (
                          <>
                            {user.role !== "board_member" && (
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  styles.promoteButton,
                                ]}
                                onPress={() =>
                                  confirmRoleChange(user, "board_member")
                                }
                              >
                                <Ionicons
                                  name="arrow-up"
                                  size={16}
                                  color="#fff"
                                />
                                <Text style={styles.actionButtonText}>
                                  {t("manageUsers.promote")}
                                </Text>
                              </TouchableOpacity>
                            )}
                            {user.role !== "community_member" && (
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  styles.demoteButton,
                                ]}
                                onPress={() =>
                                  confirmRoleChange(user, "community_member")
                                }
                              >
                                <Ionicons
                                  name="arrow-down"
                                  size={16}
                                  color="#fff"
                                />
                                <Text style={styles.actionButtonText}>
                                  {t("manageUsers.demote")}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const roleDisplayNames: Record<UserRole, string> = {
  super_admin: "Super Admin",
  board_member: "Board Member",
  community_member: "Community Member",
};

const roleOrder: Record<UserRole, number> = {
  super_admin: 0,
  board_member: 1,
  community_member: 2,
};

const getRoleColor = (role: UserRole | "all", isDark: boolean): string => {
  const colors: Record<UserRole | "all", string> = {
    super_admin: "#ff3b30",
    board_member: "#34c759",
    community_member: "#007aff",
    all: "#8e8e93",
  };
  return colors[role] ?? "#ccc";
};

const getRoleIcon = (role: UserRole): keyof typeof Ionicons.glyphMap => {
  const icons: Record<UserRole, keyof typeof Ionicons.glyphMap> = {
    super_admin: "shield",
    board_member: "people",
    community_member: "person",
  };
  return icons[role] ?? "person";
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 4, opacity: 0.7 },
  controlsContainer: { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  filtersScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "700",
  },
  errorSubtext: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  resultsTextContainer: {
    flex: 1,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: "600",
  },
  searchQueryText: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  clearAllButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,122,255,0.1)",
    borderRadius: 8,
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 8,
    opacity: 0.7,
  },
  roleBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    minWidth: 80,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  promoteButton: {
    backgroundColor: "#34c759",
  },
  demoteButton: {
    backgroundColor: "#ff3b30",
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
});