// app/(tabs)/requests.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import EmptyState from "../../components/ui/EmptyState";
import Loading from "../../components/ui/Loading";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useRole } from "../../hooks/useRole";
import { deleteRequest, getRequests } from "../../services/requestService";
import { Request } from "../../types/request";

export default function RequestsScreen() {
  useAuthGuard();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isSuperAdmin, isBoardMember } = useRole();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";

  /** Fetch all requests */
  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getRequests();
      setRequests(data);
    } catch (err: any) {
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

  /** Handle delete with confirmation */
  const handleDelete = (id: string, title: string) => {
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
              Alert.alert("Error", "Unable to delete request. Please try again.");
            }
          },
        },
      ]
    );
  };

  /** Pull to refresh */
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
      {/* Title */}
      <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>
        ❓ Requests
      </Text>

      {/* Empty / Error / List */}
      {error ? (
        <EmptyState message={error} />
      ) : requests.length === 0 ? (
        <EmptyState message="No requests found." />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" },
              ]}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
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

              {/* Description */}
              <Text
                style={[styles.desc, { color: isDark ? "#bbb" : "#555" }]}
                numberOfLines={3}
              >
                {item.description}
              </Text>

              {/* Meta Info */}
              <Text style={[styles.meta, { color: isDark ? "#aaa" : "#888" }]}>
                Status:{" "}
                <Text style={{ fontWeight: "600" }}>{item.status}</Text> • Posted
                by {item.createdBy}
              </Text>

              {/* Admin Actions */}
              {(isSuperAdmin || isBoardMember) && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id, item.title)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete request ${item.title}`}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* FAB for Create Request */}
      {(isSuperAdmin || isBoardMember) && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
          ]}
          onPress={() => console.log("Open Create Request modal")}
          accessibilityRole="button"
          accessibilityLabel="Create new request"
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 14 },

  card: {
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  info: { fontSize: 16, fontWeight: "600", marginLeft: 8, flex: 1 },
  desc: { fontSize: 14, marginBottom: 6 },
  meta: { fontSize: 12, marginBottom: 8 },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  deleteText: { color: "#fff", marginLeft: 6, fontWeight: "600" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
});
