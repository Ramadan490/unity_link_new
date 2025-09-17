import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Notification = {
  id: string;
  type: "event" | "announcement" | "request" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "HOA Meeting Reminder",
    message: "Quarterly meeting on Sept 20 at 7PM.",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    type: "announcement",
    title: "Pool Closure",
    message: "Pool closed for maintenance until Sept 18.",
    time: "1d ago",
    read: true,
  },
  {
    id: "3",
    type: "request",
    title: "New Maintenance Request",
    message: "Unit 304 submitted a plumbing issue.",
    time: "3d ago",
    read: false,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return "calendar-outline";
      case "announcement":
        return "megaphone-outline";
      case "request":
        return "document-text-outline";
      default:
        return "notifications-outline";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>🔔 Notifications</Text>
          <Text style={styles.subheader}>
            Stay updated with the latest community activity
          </Text>
        </View>
        {notifications.some((n) => !n.read) && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>You&apos;re all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.unreadCard]}
              onPress={() => markAsRead(item.id)}
              activeOpacity={0.7}
              accessibilityLabel={`Notification: ${item.title}`}
            >
              <Ionicons
                name={getIcon(item.type)}
                size={28}
                color={item.read ? "#999" : "#007AFF"}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {!item.read && <View style={styles.badge} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  header: { fontSize: 22, fontWeight: "700", color: "#2f4053" },
  subheader: { fontSize: 14, color: "#666", marginTop: 2 },

  markAllBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  markAllText: { fontSize: 13, fontWeight: "600", color: "#007AFF" },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#333" },
  message: { fontSize: 14, color: "#555", marginTop: 2 },
  time: { fontSize: 12, color: "#888", marginTop: 6 },

  badge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    marginLeft: 8,
  },

  separator: {
    height: 8,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12 },
});
