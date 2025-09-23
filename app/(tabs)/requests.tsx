import {
  deleteRequest,
  getRequests,
} from "@/features/requests/services/requestService";
import { Reply, Request } from "@/types/request";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    new Set(),
  );

  const { isSuperAdmin, isBoardMember, user } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const canCreateRequests = !!user;
  const canDeleteRequests = isSuperAdmin || isBoardMember;
  const canReply = !!user;

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
          reply.text.toLowerCase().includes(searchQuery.toLowerCase()),
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
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

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
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    if (newRequest.title.length > 100) {
      Alert.alert("Title Too Long", "Title must be less than 100 characters.");
      return;
    }

    if (newRequest.description.length > 1000) {
      Alert.alert(
        "Description Too Long",
        "Description must be less than 1000 characters.",
      );
      return;
    }

    try {
      const createdRequest: Request = {
        id: Date.now().toString(),
        title: newRequest.title.trim(),
        description: newRequest.description.trim(),
        status: "open",
        createdBy: user?.name || user?.email || "Current User",
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setRequests((prev) => [createdRequest, ...prev]);
      setNewRequest({ title: "", description: "", status: "open" });
      setModalVisible(false);

      // Show success feedback
      Alert.alert("Success", "Your request has been submitted!", [
        { text: "OK", onPress: () => {} },
      ]);
    } catch (err) {
      console.error("⚠️ Failed to create request:", err);
      Alert.alert("Error", "Unable to create request. Please try again.");
    }
  };

  /** Delete request */
  const handleDelete = (id: string, title: string) => {
    if (!canDeleteRequests) return;
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRequest(id);
              setRequests((prev) => prev.filter((r) => r.id !== id));
            } catch (err) {
              console.error("⚠️ Failed to delete request:", err);
              Alert.alert("Error", "Unable to delete request.");
            }
          },
        },
      ],
    );
  };

  /** Add reply */
  const handleAddReply = (requestId: string) => {
    const text = replyText[requestId]?.trim();
    if (!text) return;

    if (text.length > 500) {
      Alert.alert("Reply Too Long", "Reply must be less than 500 characters.");
      return;
    }

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if ((req.replies ?? []).length >= 10) {
            Alert.alert(
              "Limit Reached",
              "This request already has 10 replies.",
            );
            return req;
          }
          const newReply: Reply = {
            id: Date.now().toString(),
            text,
            createdBy: user?.name || user?.email || "User",
            createdAt: new Date().toISOString(),
          };
          return { ...req, replies: [...(req.replies ?? []), newReply] };
        }
        return req;
      }),
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

  if (loading) return <Loading message="Loading requests..." />;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>
            ❓ Requests
          </Text>
          {requests.length > 0 && (
            <Text
              style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}
            >
              {filteredRequests.length} of {requests.length} request
              {requests.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        {canCreateRequests && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search and Filter */}
      <View style={styles.filterContainer}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f7" },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isDark ? "#aaa" : "#666"}
          />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#fff" : "#000" }]}
            placeholder="Search requests..."
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          contentContainerStyle={styles.filterContent}
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
                  {filter === "all"
                    ? "All"
                    : filter === "open"
                      ? "Open"
                      : filter === "in_progress"
                        ? "In Progress"
                        : "Closed"}
                </Text>
                {filter !== "all" && (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>
                      {requests.filter((r) => r.status === filter).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ),
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
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            Failed to load requests
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.clearButton,
              { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
            ]}
            onPress={loadRequests}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Try Again</Text>
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
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            {searchQuery
              ? "No matching requests"
              : activeFilter !== "all"
                ? `No ${activeFilter.replace("_", " ")} requests`
                : "No requests found"}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {searchQuery
              ? "Try a different search term"
              : activeFilter !== "all"
                ? `There are no ${activeFilter.replace("_", " ")} requests`
                : canCreateRequests
                  ? "Be the first to create a request."
                  : "No requests have been posted yet."}
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
                Clear Filters
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
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={getStatusColor(item.status)}
                    />
                    <Text
                      style={[styles.info, { color: isDark ? "#fff" : "#333" }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.headerActions}>
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
                        {item.status === "open"
                          ? "Open"
                          : item.status === "in_progress"
                            ? "In Progress"
                            : "Closed"}
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
                  style={[styles.desc, { color: isDark ? "#bbb" : "#666" }]}
                  numberOfLines={expandedRequests.has(item.id) ? undefined : 3}
                >
                  {item.description}
                </Text>

                {/* Meta */}
                <View style={styles.metaContainer}>
                  <Text
                    style={[styles.meta, { color: isDark ? "#aaa" : "#888" }]}
                  >
                    Posted by {item.createdBy} •{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
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
                    <View style={styles.repliesHeader}>
                      <Text
                        style={[
                          styles.repliesTitle,
                          { color: isDark ? "#fff" : "#333" },
                        ]}
                      >
                        Replies ({(item.replies ?? []).length})
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
                        <View style={styles.replyHeader}>
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
                            {new Date(r.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.replyText,
                            { color: isDark ? "#ddd" : "#555" },
                          ]}
                        >
                          {r.text}
                        </Text>
                      </View>
                    ))}

                    {/* Add Reply */}
                    {canReply && expandedRequests.has(item.id) && (
                      <View style={styles.replyInputRow}>
                        <TextInput
                          style={[
                            styles.replyInput,
                            {
                              color: isDark ? "#fff" : "#000",
                              backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                              borderColor: isDark ? "#444" : "#ccc",
                            },
                          ]}
                          placeholder="Write a reply..."
                          placeholderTextColor="#888"
                          value={replyText[item.id] || ""}
                          onChangeText={(t) =>
                            setReplyText((prev) => ({ ...prev, [item.id]: t }))
                          }
                          multiline
                          maxLength={500}
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
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Create New Request
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
                    ]}
                  >
                    Title *
                  </Text>
                  <TextInput
                    placeholder="Enter request title"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                    ]}
                    value={newRequest.title}
                    onChangeText={(t) =>
                      setNewRequest((p) => ({ ...p, title: t }))
                    }
                    maxLength={100}
                  />
                  <Text style={styles.charCount}>
                    {newRequest.title.length}/100
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Description *
                  </Text>
                  <TextInput
                    placeholder="Describe your request in detail"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                    ]}
                    multiline
                    numberOfLines={5}
                    value={newRequest.description}
                    onChangeText={(t) =>
                      setNewRequest((p) => ({ ...p, description: t }))
                    }
                    maxLength={1000}
                  />
                  <Text style={styles.charCount}>
                    {newRequest.description.length}/1000
                  </Text>
                </View>

                <View style={styles.modalActions}>
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
                      Cancel
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
                      Create Request
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
