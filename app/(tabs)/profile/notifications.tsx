import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Notification = {
  id: string;
  type:
    | "event"
    | "announcement"
    | "request"
    | "system"
    | "security"
    | "maintenance";
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  action?: {
    label: string;
    onPress: () => void;
  };
};

// Generate mock notifications with more variety
const generateMockNotifications = (): Notification[] => [
  {
    id: "1",
    type: "event",
    title: "HOA Meeting Reminder",
    message:
      "Quarterly meeting on Sept 20 at 7PM in the community hall. Please RSVP by Sept 18.",
    time: "2h ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    action: {
      label: "RSVP",
      onPress: () => console.log("RSVP to meeting"),
    },
  },
  {
    id: "2",
    type: "announcement",
    title: "Pool Closure Notice",
    message:
      "Pool will be closed for maintenance from Sept 15-18. We apologize for any inconvenience.",
    time: "1d ago",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
  },
  {
    id: "3",
    type: "request",
    title: "New Maintenance Request",
    message:
      "Unit 304 submitted a plumbing issue. Please review and schedule a visit.",
    time: "3d ago",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    action: {
      label: "View Request",
      onPress: () => console.log("View maintenance request"),
    },
  },
  {
    id: "4",
    type: "security",
    title: "Security Alert",
    message:
      "Unusual activity detected near the east gate at 11:23 PM. Security team is investigating.",
    time: "5h ago",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    priority: "high",
  },
  {
    id: "5",
    type: "maintenance",
    title: "Elevator Maintenance",
    message:
      "Scheduled maintenance for Building B elevator on Sept 22 from 9AM-12PM.",
    time: "2d ago",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
  },
  {
    id: "6",
    type: "system",
    title: "App Update Available",
    message:
      "New version 2.1.0 is available with bug fixes and performance improvements.",
    time: "1w ago",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    action: {
      label: "Update",
      onPress: () => console.log("Update app"),
    },
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(
    generateMockNotifications(),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const themeColors = {
    background: isDark ? "#121212" : "#f9f9f9",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    border: isDark ? "#333" : "#e0e0e0",
    primary: isDark ? "#0A84FF" : "#007AFF",
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setNotifications(generateMockNotifications());
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => setNotifications([]),
        },
      ],
    );
  };

  const getIcon = (type: Notification["type"]) => {
    const icons = {
      event: "calendar-outline",
      announcement: "megaphone-outline",
      request: "document-text-outline",
      system: "settings-outline",
      security: "shield-checkmark-outline",
      maintenance: "construct-outline",
    };
    return icons[type];
  };

  const getIconColor = (type: Notification["type"], read: boolean) => {
    const colors = {
      event: isDark ? "#FF9500" : "#FF9500",
      announcement: isDark ? "#5856D6" : "#5856D6",
      request: isDark ? "#34C759" : "#34C759",
      system: isDark ? "#8E8E93" : "#8E8E93",
      security: isDark ? "#FF3B30" : "#FF3B30",
      maintenance: isDark ? "#007AFF" : "#007AFF",
    };
    return read ? themeColors.secondaryText : colors[type];
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    const colors = {
      high: isDark ? "#FF3B30" : "#FF3B30",
      medium: isDark ? "#FF9500" : "#FF9500",
      low: isDark ? "#34C759" : "#34C759",
    };
    return colors[priority];
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.read;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconColor = getIconColor(item.type, item.read);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: themeColors.card },
          !item.read && styles.unreadCard,
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
        accessibilityLabel={`Notification: ${item.title}`}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIcon(item.type) as any}
              size={24}
              color={iconColor}
            />
            {!item.read && (
              <View
                style={[styles.badge, { backgroundColor: priorityColor }]}
              />
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {item.title}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityColor + "20" },
                ]}
              >
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {item.priority}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.message, { color: themeColors.secondaryText }]}
            >
              {item.message}
            </Text>

            <View style={styles.footer}>
              <Text style={[styles.time, { color: themeColors.secondaryText }]}>
                {item.time}
              </Text>

              {item.action && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={item.action.onPress}
                >
                  <Text style={styles.actionText}>{item.action.label}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons
              name="notifications-outline"
              size={28}
              color={themeColors.primary}
            />
            <View>
              <Text style={[styles.headerTitle, { color: themeColors.text }]}>
                Notifications
              </Text>
              <Text
                style={[styles.subheader, { color: themeColors.secondaryText }]}
              >
                {unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "All caught up!"}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.headerButton}
              >
                <Text
                  style={[
                    styles.headerButtonText,
                    { color: themeColors.primary },
                  ]}
                >
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={styles.headerButton}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={themeColors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View
          style={[
            styles.filterContainer,
            { backgroundColor: themeColors.card },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.activeFilterTab,
              {
                backgroundColor:
                  filter === "all" ? themeColors.primary : "transparent",
              },
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === "all" ? "#fff" : themeColors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "unread" && styles.activeFilterTab,
              {
                backgroundColor:
                  filter === "unread" ? themeColors.primary : "transparent",
              },
            ]}
            onPress={() => setFilter("unread")}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === "unread" ? "#fff" : themeColors.text },
              ]}
            >
              Unread
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadCountBadge,
                  { backgroundColor: themeColors.primary },
                ]}
              >
                <Text style={styles.unreadCountText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                filter === "unread"
                  ? "checkmark-circle-outline"
                  : "notifications-off-outline"
              }
              size={64}
              color={themeColors.secondaryText}
            />
            <Text style={[styles.emptyText, { color: themeColors.text }]}>
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: themeColors.secondaryText },
              ]}
            >
              {filter === "unread"
                ? "You're all caught up!"
                : "Notifications will appear here"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={themeColors.primary}
              />
            }
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: themeColors.border },
                ]}
              />
            )}
            renderItem={renderNotificationItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  subheader: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeFilterTab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  unreadCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
  },
  unreadCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  time: {
    fontSize: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
