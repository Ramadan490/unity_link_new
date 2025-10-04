// app/(tabs)/requests.tsx
import {
  createRequest,
  deleteRequest,
  getRequests,
} from "@/features/requests/services/requestService";
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useRole } from "@/shared/hooks/useRole";
import { Request } from "@/types/request";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type RequestStatus = "open" | "in_progress" | "closed";
type FilterOption = "all" | RequestStatus;

// ✅ ADD THIS: Define a proper Reply type with content property
type Reply = {
  id: string;
  content: string; // This was missing
  userId: string;
  requestId: string;
  createdAt: string;
  createdBy?: string | { id: string; name: string };
};

export default function RequestsScreen() {
  useAuthGuard();
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isSuperAdmin, isBoardMember, user } = useRole();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    status: "open" as const,
  });
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const canCreateRequests = !!user;
  const canDeleteRequests = isSuperAdmin || isBoardMember;
  const canReply = !!user;
  const isRTL = i18n.language === "ar";

  // ✅ Safe user ID fallback
  const currentUserId = user?.id || "default-user-id-temp";

  // ✅ FIXED: Safe reply type handling
  const getReplyContent = (reply: any): string => {
    return reply.content || reply.text || reply.message || reply.body || "";
  };

  // ✅ FIXED: Safe reply author handling
  const getReplyAuthor = (reply: any): string => {
    if (typeof reply.createdBy === "object") {
      return (reply.createdBy as any)?.name || t("common.user");
    }
    return reply.createdBy || reply.userId || t("common.user");
  };

  // Filter and search requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesFilter =
        activeFilter === "all" || request.status === activeFilter;
      const matchesSearch =
        searchQuery === "" ||
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.replies ?? []).some((reply) =>
          // ✅ FIXED: Use safe content access
          getReplyContent(reply)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      return matchesFilter && matchesSearch;
    });
  }, [requests, activeFilter, searchQuery]);

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getRequests();
      setRequests(data);

      // Animate in content
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
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError(t("requests.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim, slideAnim, t]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  const toggleExpand = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    newExpanded.has(requestId)
      ? newExpanded.delete(requestId)
      : newExpanded.add(requestId);
    setExpandedRequests(newExpanded);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      Alert.alert(t("error"), t("requests.errors.fillAllFields"));
      return;
    }

    try {
      const created = await createRequest({
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        status: "open",
        createdById: currentUserId,
        communityId: "default-community-id",
      });

      setRequests((prev) => [created, ...prev]);
      setNewRequest({ title: "", description: "", status: "open" });
      setCreateModalVisible(false);
      Alert.alert(t("success"), t("requests.createSuccess"));
    } catch (err) {
      console.error("Failed to create request:", err);
      Alert.alert(t("error"), t("requests.errors.createFailed"));
    }
  };

  const handleDeleteRequest = (id: string, title: string) => {
    if (!canDeleteRequests) return;
    Alert.alert(
      t("requests.deleteConfirm"),
      t("requests.deleteConfirmMsg", { title }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRequest(id);
              setRequests((prev) => prev.filter((r) => r.id !== id));
            } catch (err) {
              console.error("Failed to delete request:", err);
              Alert.alert(t("error"), t("requests.errors.deleteFailed"));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: RequestStatus): string => {
    const colors = {
      open: "#FF6B35",
      in_progress: "#FFA726",
      closed: "#4CAF50",
    };
    return colors[status];
  };

  const getStatusIcon = (
    status: RequestStatus
  ): keyof typeof Ionicons.glyphMap => {
    const icons: Record<RequestStatus, keyof typeof Ionicons.glyphMap> = {
      open: "alert-circle",
      in_progress: "time",
      closed: "checkmark-circle",
    };
    return icons[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item, index }: { item: Request; index: number }) => {
    const isExpanded = expandedRequests.has(item.id);
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderLeftWidth: 4,
              borderLeftColor: statusColor,
              marginTop: index === 0 ? 0 : 12,
            },
          ]}
          onPress={() => toggleExpand(item.id)}
        >
          <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
                isRTL && styles.statusBadgeRTL,
              ]}
            >
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <ThemedText
                type="defaultSemiBold"
                style={[styles.statusText, { color: statusColor }]}
              >
                {t(`requests.status.${item.status}`)}
              </ThemedText>
            </View>

            <View style={styles.actions}>
              {canDeleteRequests && (
                <TouchableOpacity
                  onPress={() => handleDeleteRequest(item.id, item.title)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => toggleExpand(item.id)}
                style={styles.expandBtn}
              >
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ThemedText type="defaultSemiBold" style={styles.requestTitle}>
            {item.title}
          </ThemedText>

          <ThemedText
            type="default"
            style={styles.requestDescription}
            numberOfLines={isExpanded ? undefined : 3}
          >
            {item.description}
          </ThemedText>

          {isExpanded && item.replies && item.replies.length > 0 && (
            <View style={styles.repliesSection}>
              <ThemedText type="defaultSemiBold" style={styles.repliesTitle}>
                {t("requests.replies")} ({item.replies.length})
              </ThemedText>
              {item.replies.map((reply, replyIndex) => (
                <View
                  key={replyIndex}
                  style={[styles.replyCard, isRTL && styles.replyCardRTL]}
                >
                  <ThemedText type="default" style={styles.replyContent}>
                    {/* ✅ FIXED: Use safe content access */}
                    {getReplyContent(reply)}
                  </ThemedText>
                  <View
                    style={[styles.replyFooter, isRTL && styles.replyFooterRTL]}
                  >
                    <ThemedText type="subtitle" style={styles.replyAuthor}>
                      {/* ✅ FIXED: Use safe author access */}
                      {getReplyAuthor(reply)}
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.replyDate}>
                      {formatDate(reply.createdAt)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.cardFooter, isRTL && styles.cardFooterRTL]}>
            <View
              style={[styles.dateContainer, isRTL && styles.dateContainerRTL]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.dateText}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>

            <View
              style={[styles.repliesCount, isRTL && styles.repliesCountRTL]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.repliesCountText}>
                {item.replies?.length || 0}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const requestFilters: { key: FilterOption; label: string; count: number }[] =
    [
      {
        key: "all",
        label: t("requests.filters.all"),
        count: requests.length,
      },
      {
        key: "open",
        label: t("requests.filters.open"),
        count: requests.filter((r) => r.status === "open").length,
      },
      {
        key: "in_progress",
        label: t("requests.filters.inProgress"),
        count: requests.filter((r) => r.status === "in_progress").length,
      },
      {
        key: "closed",
        label: t("requests.filters.closed"),
        count: requests.filter((r) => r.status === "closed").length,
      },
    ];

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          {t("requests.loading")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>
          {t("requests.errorTitle")}
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={loadRequests}
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
            {t("requests.title")}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.subtitle, isRTL && styles.textRTL]}
          >
            {t("requests.subtitle", { count: requests.length })}
          </ThemedText>
        </View>

        {canCreateRequests && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.createButtonText}>
              {t("requests.create")}
            </ThemedText>
          </TouchableOpacity>
        )}
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
          placeholder={t("requests.searchPlaceholder")}
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

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {requestFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  activeFilter === filter.key
                    ? getStatusColor(filter.key as RequestStatus)
                    : theme.colors.surface2,
              },
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <ThemedText
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === filter.key ? "#fff" : theme.colors.text,
                  fontWeight: activeFilter === filter.key ? "600" : "400",
                },
              ]}
            >
              {filter.label} ({filter.count})
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Requests List */}
      <Animated.FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
              name="document-text-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? t("requests.noResults") : t("requests.emptyTitle")}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {searchQuery
                ? t("requests.noResultsText")
                : t("requests.emptyText")}
            </ThemedText>
          </View>
        }
      />

      {/* Create Request Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {t("requests.createNew")}
            </ThemedText>
            <TouchableOpacity
              onPress={() => setCreateModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              placeholder={t("requests.form.title")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newRequest.title}
              onChangeText={(text) =>
                setNewRequest((prev) => ({ ...prev, title: text }))
              }
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              placeholder={t("requests.form.description")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newRequest.description}
              onChangeText={(text) =>
                setNewRequest((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleCreateRequest}
            >
              <ThemedText style={styles.submitButtonText}>
                {t("requests.submitRequest")}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  card: {
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderRTL: {
    flexDirection: "row-reverse",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeRTL: {
    flexDirection: "row-reverse",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  expandBtn: {
    padding: 4,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  requestDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  repliesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyCardRTL: {
    alignItems: "flex-end",
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  replyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyFooterRTL: {
    flexDirection: "row-reverse",
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
  replyDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cardFooterRTL: {
    flexDirection: "row-reverse",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateContainerRTL: {
    flexDirection: "row-reverse",
  },
  dateText: {
    fontSize: 13,
    opacity: 0.7,
  },
  repliesCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  repliesCountRTL: {
    flexDirection: "row-reverse",
  },
  repliesCountText: {
    fontSize: 13,
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
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalHeaderRTL: {
    flexDirection: "row-reverse",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  textRTL: {
    textAlign: "right",
  },
});
