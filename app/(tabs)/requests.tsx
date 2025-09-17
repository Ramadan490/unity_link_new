import {
  deleteRequest,
  getRequests,
} from "@/features/requests/services/requestService";
import { Reply, Request } from "@/types/request";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../../shared/components/ui/EmptyState";
import Loading from "../../shared/components/ui/Loading";
import { useAuthGuard } from "../../shared/hooks/useAuthGuard";
import { useRole } from "../../shared/hooks/useRole";

export default function RequestsScreen() {
  useAuthGuard();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    status: "open" as const,
  });

  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const { isSuperAdmin, isBoardMember, user } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const canCreateRequests = !!user;
  const canDeleteRequests = isSuperAdmin || isBoardMember;

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
    } catch (err) {
      console.error("⚠️ Failed to fetch requests:", err);
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /** Create a request */
  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    try {
      const createdRequest: Request = {
        id: Date.now().toString(),
        title: newRequest.title,
        description: newRequest.description,
        status: "open",
        createdBy: user?.name || user?.email || "Current User",
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setRequests((prev) => [createdRequest, ...prev]);
      setNewRequest({ title: "", description: "", status: "open" });
      setModalVisible(false);
      Alert.alert("Success", "Your request has been submitted!");
    } catch (err) {
      console.error("⚠️ Failed to create request:", err);
      Alert.alert("Error", "Unable to create request. Please try again.");
    }
  };

  /** Delete request */
  const handleDelete = (id: string, title: string) => {
    if (!canDeleteRequests) return;
    Alert.alert("Confirm Delete", `Delete "${title}"?`, [
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
    ]);
  };

  /** Add reply */
  const handleAddReply = (requestId: string) => {
    const text = replyText[requestId]?.trim();
    if (!text) return;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          if ((req.replies ?? []).length >= 5) {
            Alert.alert("Limit Reached", "This request already has 5 replies.");
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
              {requests.length} request{requests.length !== 1 ? "s" : ""}
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

      {/* List / Empty */}
      {error ? (
        <EmptyState message={error} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={isDark ? "#444" : "#ccc"}
          />
          <Text
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            No requests found
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canCreateRequests
              ? "Be the first to create a request."
              : "No requests have been posted yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <View
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
                    size={22}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <Text
                    style={[styles.info, { color: isDark ? "#fff" : "#333" }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </View>
                {canDeleteRequests && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.title)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Description */}
              <Text
                style={[styles.desc, { color: isDark ? "#bbb" : "#666" }]}
                numberOfLines={3}
              >
                {item.description}
              </Text>

              {/* Meta */}
              <View style={styles.metaContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "closed"
                          ? isDark
                            ? "#2C7A4A"
                            : "#34C759"
                          : item.status === "in_progress"
                            ? isDark
                              ? "#4A3C7A"
                              : "#AF52DE"
                            : isDark
                              ? "#2C2C2E"
                              : "#F2F2F7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "closed"
                            ? "#fff"
                            : item.status === "in_progress"
                              ? "#fff"
                              : isDark
                                ? "#0A84FF"
                                : "#007AFF",
                      },
                    ]}
                  >
                    {item.status === "open"
                      ? "Open"
                      : item.status === "in_progress"
                        ? "In Progress"
                        : "Closed"}
                  </Text>
                </View>
                <Text
                  style={[styles.meta, { color: isDark ? "#aaa" : "#888" }]}
                >
                  Posted by {item.createdBy}
                </Text>
              </View>

              {/* Replies */}
              {(item.replies ?? []).length > 0 && (
                <View style={styles.repliesSection}>
                  <Text
                    style={[
                      styles.repliesTitle,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Replies ({(item.replies ?? []).length})
                  </Text>
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
                      <Text
                        style={[
                          styles.replyAuthor,
                          { color: isDark ? "#0A84FF" : "#007AFF" },
                        ]}
                      >
                        {r.createdBy}:
                      </Text>
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
                </View>
              )}

              {/* Add Reply */}
              {user && (
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
                  />
                  <TouchableOpacity
                    onPress={() => handleAddReply(item.id)}
                    style={styles.sendButton}
                  >
                    <Ionicons
                      name="send-outline"
                      size={22}
                      color={isDark ? "#0A84FF" : "#007AFF"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
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
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </View>

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
                />

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
                />

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
                          newRequest.title && newRequest.description
                            ? isDark
                              ? "#0A84FF"
                              : "#007AFF"
                            : isDark
                              ? "#444"
                              : "#ccc",
                      },
                    ]}
                    onPress={handleCreateRequest}
                    disabled={!newRequest.title || !newRequest.description}
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
    paddingBottom: 10,
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
  },
  info: { fontSize: 18, fontWeight: "700", marginLeft: 8, flex: 1 },
  desc: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: "600" },
  meta: { fontSize: 12 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  repliesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(150,150,150,0.2)",
  },
  repliesTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  replyCard: { padding: 12, borderRadius: 8, marginBottom: 8 },
  replyAuthor: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  replyText: { fontSize: 14, lineHeight: 18 },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: { padding: 8 },
  modalContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: { width: "100%", borderRadius: 20, overflow: "hidden" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  textArea: { height: 120, textAlignVertical: "top" },
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
