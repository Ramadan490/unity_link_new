// app/(tabs)/manageUsers.tsx
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { useRoleManagement } from "@/shared/hooks/useRoleManagement";
import { User, UserRole, UserRoles } from "@/shared/types/user";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ManageUsersScreen() {
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const { users, updateUserRole, loading, error, refetch } =
    useRoleManagement();
  const { isSuperAdmin } = useRole();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    UserRole | "all"
  >("all");

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const isRTL = i18n.language === "ar";

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

    // Animate in content after refresh
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    setRefreshing(false);
  }, [refetch, fadeAnim, slideAnim]);

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
    const action =
      newRole === UserRoles.COMMUNITY_MEMBER ? "demote" : "promote";
    const roleName = roleDisplayNames[newRole];
    const currentRoleName =
      roleDisplayNames[user.role as UserRole] || user.role;

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
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    let result = safeUsers.filter(
      (user) =>
        (user.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedRoleFilter !== "all") {
      result = result.filter(
        (user) => user.role === (selectedRoleFilter as UserRole)
      );
    }

    return result.sort((a, b) => {
      if (roleOrder[a.role as UserRole] !== roleOrder[b.role as UserRole]) {
        return roleOrder[a.role as UserRole] - roleOrder[b.role as UserRole];
      }
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [safeUsers, searchQuery, selectedRoleFilter]);

  const roleFilters: { key: UserRole | "all"; label: string; count: number }[] =
    [
      {
        key: "all",
        label: t("manageUsers.filters.all"),
        count: safeUsers.length,
      },
      {
        key: UserRoles.SUPER_ADMIN,
        label: t("manageUsers.filters.admins"),
        count: safeUsers.filter((u) => u.role === UserRoles.SUPER_ADMIN).length,
      },
      {
        key: UserRoles.BOARD_MEMBER,
        label: t("manageUsers.filters.board"),
        count: safeUsers.filter((u) => u.role === UserRoles.BOARD_MEMBER)
          .length,
      },
      {
        key: UserRoles.COMMUNITY_MEMBER,
        label: t("manageUsers.filters.members"),
        count: safeUsers.filter((u) => u.role === UserRoles.COMMUNITY_MEMBER)
          .length,
      },
    ];

  const renderUserItem = ({
    item: user,
    index,
  }: {
    item: User;
    index: number;
  }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: theme.colors.card,
            borderLeftWidth: 4,
            borderLeftColor: getRoleColor(user.role as UserRole),
            marginTop: index === 0 ? 0 : 12,
          },
        ]}
      >
        <View style={styles.userMain}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: getRoleColor(user.role as UserRole) + "20",
                },
              ]}
            >
              <Ionicons
                name={getRoleIcon(user.role as UserRole)}
                size={24}
                color={getRoleColor(user.role as UserRole)}
              />
            </View>
            <View style={styles.userDetails}>
              <ThemedText type="defaultSemiBold" style={styles.userName}>
                {user.name || t("manageUsers.anonymous")}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.userEmail}>
                {user.email}
              </ThemedText>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: getRoleColor(user.role as UserRole),
                  },
                ]}
              >
                <Ionicons
                  name={getRoleIcon(user.role as UserRole)}
                  size={12}
                  color="#fff"
                  style={styles.roleIcon}
                />
                <ThemedText style={styles.roleText}>
                  {roleDisplayNames[user.role as UserRole]}
                </ThemedText>
              </View>
            </View>
          </View>

          {updatingUserId === user.id ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <View style={styles.actions}>
              {user.role !== UserRoles.SUPER_ADMIN && (
                <>
                  {user.role !== UserRoles.BOARD_MEMBER && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.promoteButton]}
                      onPress={() =>
                        confirmRoleChange(user, UserRoles.BOARD_MEMBER)
                      }
                    >
                      <Ionicons name="arrow-up" size={16} color="#fff" />
                      <ThemedText style={styles.actionButtonText}>
                        {t("manageUsers.promote")}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  {user.role !== UserRoles.COMMUNITY_MEMBER && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.demoteButton]}
                      onPress={() =>
                        confirmRoleChange(user, UserRoles.COMMUNITY_MEMBER)
                      }
                    >
                      <Ionicons name="arrow-down" size={16} color="#fff" />
                      <ThemedText style={styles.actionButtonText}>
                        {t("manageUsers.demote")}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  if (!isSuperAdmin) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + 100 }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.surface2 },
            ]}
          >
            <Ionicons
              name="shield-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
          </View>
          <ThemedText type="title" style={styles.permissionTitle}>
            {t("manageUsers.accessRestricted")}
          </ThemedText>
          <ThemedText type="default" style={styles.permissionText}>
            {t("manageUsers.superAdminRequired")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          {t("manageUsers.loading")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>
          {t("manageUsers.errorTitle")}
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={refetch}
        >
          <ThemedText style={styles.retryButtonText}>
            {t("buttons.retry")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 20 },
          isRTL && styles.headerRTL,
        ]}
      >
        <View>
          <ThemedText
            type="title"
            style={[styles.title, isRTL && styles.textRTL]}
          >
            {t("manageUsers.title")}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.subtitle, isRTL && styles.textRTL]}
          >
            {t("manageUsers.subtitle", { count: safeUsers.length })}
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
          placeholder={t("manageUsers.searchPlaceholder")}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Role Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {roleFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedRoleFilter === filter.key
                    ? getRoleColor(filter.key as any)
                    : theme.colors.surface2,
              },
            ]}
            onPress={() => setSelectedRoleFilter(filter.key)}
          >
            <ThemedText
              style={[
                styles.filterText,
                {
                  color:
                    selectedRoleFilter === filter.key
                      ? "#fff"
                      : theme.colors.text,
                  fontWeight: selectedRoleFilter === filter.key ? "600" : "400",
                },
              ]}
            >
              {filter.label} ({filter.count})
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <Animated.FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery
                ? t("manageUsers.noResults")
                : t("manageUsers.emptyTitle")}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {searchQuery
                ? t("manageUsers.noResultsText")
                : t("manageUsers.emptyText")}
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

// Constants
const roleDisplayNames: Record<UserRole, string> = {
  super_admin: "Super Admin",
  board_member: "Board Member",
  community_member: "Community Member",
} as const;

const roleOrder: Record<UserRole, number> = {
  super_admin: 0,
  board_member: 1,
  community_member: 2,
} as const;

const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    super_admin: "#FF3B30",
    board_member: "#34C759",
    community_member: "#007AFF",
  };
  return colors[role] ?? "#8E8E93";
};

const getRoleIcon = (role: UserRole): keyof typeof Ionicons.glyphMap => {
  const icons: Record<UserRole, keyof typeof Ionicons.glyphMap> = {
    super_admin: "shield",
    board_member: "people",
    community_member: "person",
  };
  return icons[role];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRTL: {
    flexDirection: "row-reverse",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  userCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
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
    backgroundColor: "#34C759",
  },
  demoteButton: {
    backgroundColor: "#FF3B30",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  textRTL: {
    textAlign: "right",
  },
});
