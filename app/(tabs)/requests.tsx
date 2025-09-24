import {
  deleteRequest,
  getRequests,
} from "@/features/requests/services/requestService";
import { useTheme } from "@/shared/context/ThemeContext";
import { Reply, Request } from "@/types/request";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loading from "../../shared/components/ui/Loading";
import { useAuthGuard } from "../../shared/hooks/useAuthGuard";
import { useRole } from "../../shared/hooks/useRole";

// Request status type
type RequestStatus = "open" | "in_progress" | "closed";

// Filter options
type FilterOption = "all" | RequestStatus;

export default function RequestsScreen() {
  useAuthGuard();
  const { t, i18n } = useTranslation();
  const { isRTL } = useTheme();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    status: "open" as const,
  });

  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );

  const { isSuperAdmin, isBoardMember, user } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const canCreateRequests = !!user;
  const canDeleteRequests = isSuperAdmin || isBoardMember;
  const canReply = !!user;

  // Check if current language is Arabic
  const isArabic = i18n.language === "ar";

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
          reply.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesFilter && matchesSearch;
    });
  }, [requests, activeFilter, searchQuery]);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  /** Fetch requests */
  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getRequests();

      const normalized = data.map((r: any) => ({
        ...r,
        replies: r.replies ?? [],
      }));

      setRequests(normalized);

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error("⚠️ Failed to fetch requests:", err);
      setError(t("requests.failedToLoad"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim, t]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /** Toggle request expansion */
  const toggleExpand = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  /** Create a request */
  const handleCreateRequest = () => {
    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      Alert.alert(t("common.missingInfo"), t("requests.fillAllFields"));
      return;
    }

    if (newRequest.title.length > 100) {
      Alert.alert(t("common.titleTooLong"), t("requests.titleMaxLength"));
      return;
    }

    if (newRequest.description.length > 1000) {
      Alert.alert(
        t("common.descriptionTooLong"),
        t("requests.descriptionMaxLength")
      );
      return;
    }

    try {
      const createdRequest: Request = {
        id: Date.now().toString(),
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        status: "open",
        createdBy: user?.name || user?.email || t("common.currentUser"),
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setRequests((prev) => [createdRequest, ...prev]);
      setNewRequest({ title: "", description: "", status: "open" });
      setModalVisible(false);

      // Show success feedback
      Alert.alert(t("common.success"), t("requests.requestSubmitted"), [
        { text: t("common.ok"), onPress: () => {} },
      ]);
    } catch (err) {
      console.error("⚠️ Failed to create request:", err);
      Alert.alert(t("common.error"), t("requests.createError"));
    }
  };

  /** Delete request */
  const handleDelete = (id: string, title: string) => {
    if (!canDeleteRequests) return;
    Alert.alert(
      t("common.confirmDelete"),
      t("requests.deleteConfirmation", { title }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRequest(id);
              setRequests((prev) => prev.filter((r) => r.id !== id));
            } catch (err) {
              console.error("⚠️ Failed to delete request:", err);
              Alert.alert(t("common.error"), t("requests.deleteError"));
            }
          },
        },
      ]
    );
  };

  /** Add reply */
  const handleAddReply = (requestId: string) => {
    const text = replyText[requestId]?.trim();
    if (!text) return;

    if (text.length > 500) {
      Alert.alert(t("common.replyTooLong"), t("requests.replyMaxLength"));
      return;
    }

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if ((req.replies ?? []).length >= 10) {
            Alert.alert(
              t("common.limitReached"),
              t("requests.maxRepliesReached")
            );
            return req;
          }
          const newReply: Reply = {
            id: Date.now().toString(),
            text,
            createdBy: user?.name || user?.email || t("common.user"),
            createdAt: new Date().toISOString(),
          };
          return { ...req, replies: [...(req.replies ?? []), newReply] };
        }
        return req;
      })
    );

    setReplyText((prev) => ({ ...prev, [requestId]: "" }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  // Status badge colors
  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      open: isDark ? "#0A84FF" : "#007AFF",
      in_progress: isDark ? "#FF9500" : "#FF9500",
      closed: isDark ? "#34C759" : "#34C759",
    };
    return colors[status];
  };

  // Status badge background colors
  const getStatusBgColor = (status: RequestStatus) => {
    const colors = {
      open: isDark ? "rgba(10, 132, 255, 0.2)" : "rgba(0, 122, 255, 0.1)",
      in_progress: isDark ? "rgba(255, 149, 0, 0.2)" : "rgba(255, 149, 0, 0.1)",
      closed: isDark ? "rgba(52, 199, 89, 0.2)" : "rgba(52, 199, 89, 0.1)",
    };
    return colors[status];
  };

  // Get status text translation
  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "open":
        return t("requests.status.open");
      case "in_progress":
        return t("requests.status.inProgress");
      case "closed":
        return t("requests.status.closed");
      default:
        return status;
    }
  };

  // RTL styles
  const rtlStyles = isArabic
    ? {
        textAlign: "right" as const,
        writingDirection: "rtl" as const,
        flexDirection: "row-reverse" as const,
      }
    : {};

  if (loading) return <Loading message={t("requests.loading")} />;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View
          style={[styles.headerContent, isArabic && { alignItems: "flex-end" }]}
        >
          <Text
            style={[
              styles.title,
              { color: isDark ? "#fff" : "#2f4053" },
              rtlStyles,
            ]}
          >
            {t("requests.title")}
          </Text>
          {requests.length > 0 && (
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#aaa" : "#666" },
                rtlStyles,
              ]}
            >
              {t("requests.requestCount", {
                filtered: filteredRequests.length,
                total: requests.length,
              })}
            </Text>
          )}
        </View>
        {canCreateRequests && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
              isArabic && styles.rtlButton,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>{t("requests.create")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filter */}
      <View style={[styles.filterContainer, isArabic && styles.rtlContainer]}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f7" },
            isArabic && styles.rtlSearchContainer,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isDark ? "#aaa" : "#666"}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? "#fff" : "#000" },
              rtlStyles,
            ]}
            placeholder={t("requests.searchPlaceholder")}
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign={isArabic ? "right" : "left"}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={isDark ? "#aaa" : "#666"}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={[
            styles.filterContent,
            isArabic && { flexDirection: "row-reverse" },
          ]}
        >
          {(["all", "open", "in_progress", "closed"] as FilterOption[]).map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      activeFilter === filter
                        ? getStatusColor(filter === "all" ? "open" : filter)
                        : isDark
                          ? "#2a2a2a"
                          : "#f0f0f0",
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        activeFilter === filter
                          ? "#fff"
                          : isDark
                            ? "#fff"
                            : "#333",
                    },
                  ]}
                >
                  {filter === "all" ? t("common.all") : getStatusText(filter)}
                </Text>
                {filter !== "all" && (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>
                      {requests.filter((r) => r.status === filter).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      {/* List / Empty */}
      {error ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="warning-outline"
            size={64}
            color={isDark ? "#444" : "#ccc"}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: isDark ? "#fff" : "#333" },
              rtlStyles,
            ]}
          >
            {t("requests.loadError")}
          </Text>
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? "#aaa" : "#666" },
              rtlStyles,
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.clearButton,
              { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
            ]}
            onPress={loadRequests}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {t("common.tryAgain")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={
              searchQuery || activeFilter !== "all"
                ? "search-outline"
                : "document-text-outline"
            }
            size={64}
            color={isDark ? "#444" : "#ccc"}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: isDark ? "#fff" : "#333" },
              rtlStyles,
            ]}
          >
            {searchQuery
              ? t("requests.noMatchingRequests")
              : activeFilter !== "all"
                ? t("requests.noStatusRequests", {
                    status: getStatusText(activeFilter),
                  })
                : t("requests.noRequestsFound")}
          </Text>
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? "#aaa" : "#666" },
              rtlStyles,
            ]}
          >
            {searchQuery
              ? t("requests.tryDifferentSearch")
              : activeFilter !== "all"
                ? t("requests.noRequestsForStatus", {
                    status: getStatusText(activeFilter),
                  })
                : canCreateRequests
                  ? t("requests.beFirstToCreate")
                  : t("requests.noRequestsPosted")}
          </Text>
          {(searchQuery || activeFilter !== "all") && (
            <TouchableOpacity
              style={[
                styles.clearButton,
                { backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0" },
              ]}
              onPress={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              <Text
                style={{ color: isDark ? "#fff" : "#333", fontWeight: "600" }}
              >
                {t("common.clearFilters")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#fff" : "#000"}
              />
            }
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleExpand(item.id)}
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
                ]}
              >
                {/* Title Row */}
                <View
                  style={[styles.cardHeader, isArabic && styles.rtlCardHeader]}
                >
                  <View
                    style={[
                      styles.cardTitleContainer,
                      isArabic && styles.rtlTitleContainer,
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={getStatusColor(item.status)}
                    />
                    <Text
                      style={[
                        styles.info,
                        { color: isDark ? "#fff" : "#333" },
                        rtlStyles,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.headerActions,
                      isArabic && styles.rtlActions,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBgColor(item.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                    {canDeleteRequests && (
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.title)}
                        style={styles.deleteButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#FF3B30"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Description */}
                <Text
                  style={[
                    styles.desc,
                    { color: isDark ? "#bbb" : "#666" },
                    rtlStyles,
                  ]}
                  numberOfLines={expandedRequests.has(item.id) ? undefined : 3}
                >
                  {item.description}
                </Text>

                {/* Meta */}
                <View
                  style={[
                    styles.metaContainer,
                    isArabic && styles.rtlMetaContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.meta,
                      { color: isDark ? "#aaa" : "#888" },
                      rtlStyles,
                    ]}
                  >
                    {t("requests.postedBy", {
                      user: item.createdBy,
                      date: new Date(item.createdAt).toLocaleDateString(
                        i18n.language
                      ),
                    })}
                  </Text>
                  <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                    <Ionicons
                      name={
                        expandedRequests.has(item.id)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={16}
                      color={isDark ? "#aaa" : "#888"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Replies - Only show when expanded or if there are replies */}
                {((item.replies ?? []).length > 0 ||
                  expandedRequests.has(item.id)) && (
                  <View style={styles.repliesSection}>
                    <View
                      style={[
                        styles.repliesHeader,
                        isArabic && { alignItems: "flex-end" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.repliesTitle,
                          { color: isDark ? "#fff" : "#333" },
                          rtlStyles,
                        ]}
                      >
                        {t("requests.repliesCount", {
                          count: (item.replies ?? []).length,
                        })}
                      </Text>
                    </View>

                    {(item.replies ?? []).map((r) => (
                      <View
                        key={r.id}
                        style={[
                          styles.replyCard,
                          {
                            backgroundColor: isDark ? "#2a2a2a" : "#f8f8f8",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.replyHeader,
                            isArabic && styles.rtlReplyHeader,
                          ]}
                        >
                          <Text
                            style={[
                              styles.replyAuthor,
                              { color: isDark ? "#0A84FF" : "#007AFF" },
                            ]}
                          >
                            {r.createdBy}
                          </Text>
                          <Text
                            style={[
                              styles.replyDate,
                              { color: isDark ? "#666" : "#999" },
                            ]}
                          >
                            {new Date(r.createdAt).toLocaleDateString(
                              i18n.language
                            )}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.replyText,
                            { color: isDark ? "#ddd" : "#555" },
                            rtlStyles,
                          ]}
                        >
                          {r.text}
                        </Text>
                      </View>
                    ))}

                    {/* Add Reply */}
                    {canReply && expandedRequests.has(item.id) && (
                      <View
                        style={[
                          styles.replyInputRow,
                          isArabic && styles.rtlReplyInput,
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.replyInput,
                            {
                              color: isDark ? "#fff" : "#000",
                              backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                              borderColor: isDark ? "#444" : "#ccc",
                            },
                            rtlStyles,
                          ]}
                          placeholder={t("requests.writeReply")}
                          placeholderTextColor="#888"
                          value={replyText[item.id] || ""}
                          onChangeText={(t) =>
                            setReplyText((prev) => ({ ...prev, [item.id]: t }))
                          }
                          multiline
                          maxLength={500}
                          textAlign={isArabic ? "right" : "left"}
                        />
                        <TouchableOpacity
                          onPress={() => handleAddReply(item.id)}
                          style={[
                            styles.sendButton,
                            { opacity: replyText[item.id]?.trim() ? 1 : 0.5 },
                          ]}
                          disabled={!replyText[item.id]?.trim()}
                        >
                          <Ionicons
                            name="send"
                            size={20}
                            color={isDark ? "#0A84FF" : "#007AFF"}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}

      {/* Create Request Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalBox,
                  { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
                ]}
              >
                <View
                  style={[
                    styles.modalHeader,
                    isArabic && styles.rtlModalHeader,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: isDark ? "#fff" : "#333" },
                      rtlStyles,
                    ]}
                  >
                    {t("requests.createNewRequest")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                      rtlStyles,
                    ]}
                  >
                    {t("common.title")} *
                  </Text>
                  <TextInput
                    placeholder={t("requests.enterTitle")}
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                      rtlStyles,
                    ]}
                    value={newRequest.title}
                    onChangeText={(t) =>
                      setNewRequest((p) => ({ ...p, title: t }))
                    }
                    maxLength={100}
                    textAlign={isArabic ? "right" : "left"}
                  />
                  <Text
                    style={[
                      styles.charCount,
                      isArabic && { textAlign: "left" },
                    ]}
                  >
                    {newRequest.title.length}/100
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                      rtlStyles,
                    ]}
                  >
                    {t("common.description")} *
                  </Text>
                  <TextInput
                    placeholder={t("requests.describeRequest")}
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                      rtlStyles,
                    ]}
                    multiline
                    numberOfLines={5}
                    value={newRequest.description}
                    onChangeText={(t) =>
                      setNewRequest((p) => ({ ...p, description: t }))
                    }
                    maxLength={1000}
                    textAlign={isArabic ? "right" : "left"}
                    textAlignVertical="top"
                  />
                  <Text
                    style={[
                      styles.charCount,
                      isArabic && { textAlign: "left" },
                    ]}
                  >
                    {newRequest.description.length}/1000
                  </Text>
                </View>

                <View
                  style={[
                    styles.modalActions,
                    isArabic && styles.rtlModalActions,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: isDark ? "#fff" : "#000",
                      }}
                    >
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor:
                          newRequest.title.trim() &&
                          newRequest.description.trim()
                            ? isDark
                              ? "#0A84FF"
                              : "#007AFF"
                            : isDark
                              ? "#444"
                              : "#ccc",
                      },
                    ]}
                    onPress={handleCreateRequest}
                    disabled={
                      !newRequest.title.trim() || !newRequest.description.trim()
                    }
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {t("requests.createRequest")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "500" },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // RTL Styles
  rtlContainer: {
    flexDirection: "row-reverse",
  },
  rtlButton: {
    flexDirection: "row-reverse",
  },
  rtlSearchContainer: {
    flexDirection: "row-reverse",
  },
  rtlCardHeader: {
    flexDirection: "row-reverse",
  },
  rtlTitleContainer: {
    flexDirection: "row-reverse",
  },
  rtlActions: {
    flexDirection: "row-reverse",
  },
  rtlMetaContainer: {
    flexDirection: "row-reverse",
  },
  rtlReplyHeader: {
    flexDirection: "row-reverse",
  },
  rtlReplyInput: {
    flexDirection: "row-reverse",
  },
  rtlModalHeader: {
    flexDirection: "row-reverse",
  },
  rtlModalActions: {
    flexDirection: "row-reverse",
  },

  // Filter and Search
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterCount: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  filterCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Card Styles
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  info: { fontSize: 18, fontWeight: "700", flex: 1 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  deleteButton: {
    padding: 4,
  },
  desc: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  meta: { fontSize: 12 },

  // Replies
  repliesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.2)",
    gap: 8,
  },
  repliesHeader: {
    marginBottom: 8,
  },
  repliesTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  replyCard: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "600",
  },
  replyDate: {
    fontSize: 11,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 18,
  },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 40,
  },
  sendButton: {
    padding: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },

  // Modal
  modalContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    marginRight: 20,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
});
