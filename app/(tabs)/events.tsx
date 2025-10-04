// app/(tabs)/events.tsx
import {
  createEvent,
  deleteEvent as deleteEventAPI,
  getEvents,
} from "@/features/events/services/eventService";
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Event } from "@/shared/types/events";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

export default function EventsScreen() {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSuperAdmin, isBoardMember, user } = useRole();
  const canManageEvents = isSuperAdmin || isBoardMember;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    status: "upcoming" as Event["status"],
  });

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // ✅ Replace this with context/profile later
  const communityId = "ec6dea87-7303-45a6-9cbc-ecb87bdd3b89";
  const isRTL = i18n.language === "ar";

  // ✅ Safe user ID fallback
  const currentUserId = user?.id || "default-user-id-temp";

  // ✅ Fetch events from backend
  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await getEvents(communityId);
      setEvents(data);

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
      console.error("Failed to load events:", err);
      setError(t("events.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId, t, fadeAnim, slideAnim]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  // ✅ Status functions with type safety - USING LOWERCASE TO MATCH YOUR TYPES
  const getStatusColor = (status: Event["status"] | undefined): string => {
    const colors: Record<Event["status"], string> = {
      upcoming: "#007AFF",
      past: "#8E8E93",
      cancelled: "#FF3B30",
    };
    return colors[status || "upcoming"];
  };

  const getStatusIcon = (
    status: Event["status"] | undefined
  ): keyof typeof Ionicons.glyphMap => {
    const icons: Record<Event["status"], keyof typeof Ionicons.glyphMap> = {
      upcoming: "calendar",
      past: "checkmark-circle",
      cancelled: "close-circle",
    };
    return icons[status || "upcoming"];
  };

  const createEventHandler = async () => {
    if (
      !newEvent.title.trim() ||
      !newEvent.date.trim() ||
      !newEvent.location.trim()
    ) {
      Alert.alert(t("error"), t("events.errors.fillAllFields"));
      return;
    }

    try {
      const created = await createEvent(communityId, {
        ...newEvent,
        createdById: currentUserId,
      });
      setEvents((prev) => [created, ...prev]);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        location: "",
        status: "upcoming",
      });
      setCreateModalVisible(false);
      Alert.alert(t("success"), t("events.createSuccess"));
    } catch (err) {
      console.error("Error creating event:", err);
      Alert.alert(t("error"), t("events.errors.createFailed"));
    }
  };

  const deleteEventHandler = (id: string, title: string) => {
    Alert.alert(
      t("events.deleteConfirm"),
      t("events.deleteConfirmMsg", { title }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEventAPI(id);
              setEvents((prev) => prev.filter((e) => e.id !== id));
            } catch (err) {
              console.error("Failed to delete event:", err);
              Alert.alert(t("error"), t("events.errors.deleteFailed"));
            }
          },
        },
      ]
    );
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

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const renderItem = ({ item, index }: { item: Event; index: number }) => {
    const status =
      item.status || (isEventPast(item.date) ? "past" : "upcoming");
    const statusColor = getStatusColor(status);
    const statusIcon = getStatusIcon(status);

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
                {t(`events.status.${status}`)}
              </ThemedText>
            </View>

            {canManageEvents && (
              <TouchableOpacity
                onPress={() => deleteEventHandler(item.id, item.title)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#ff3b30" />
              </TouchableOpacity>
            )}
          </View>

          <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
            {item.title}
          </ThemedText>

          {item.description && (
            <ThemedText
              type="default"
              style={styles.eventDescription}
              numberOfLines={3}
            >
              {item.description}
            </ThemedText>
          )}

          <View style={styles.eventDetails}>
            <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.detailText}>
                {formatDate(item.date)}
              </ThemedText>
            </View>

            <View style={[styles.detailRow, isRTL && styles.detailRowRTL]}>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.detailText}>
                {item.location}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.cardFooter, isRTL && styles.cardFooterRTL]}>
            <View
              style={[
                styles.attendanceContainer,
                isRTL && styles.attendanceContainerRTL,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.attendanceText}>
                {t("events.attendance", { count: item.donations || 0 })}
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.rsvpBtn}>
              <ThemedText type="defaultSemiBold" style={styles.rsvpText}>
                {t("events.rsvp")}
              </ThemedText>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          {t("events.loading")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>
          {t("events.errorTitle")}
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={fetchEvents}
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
            {t("events.title")}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.subtitle, isRTL && styles.textRTL]}
          >
            {t("events.subtitle", { count: events.length })}
          </ThemedText>
        </View>

        {canManageEvents && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.createButtonText}>
              {t("events.create")}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Events List */}
      <Animated.FlatList
        data={events}
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
              name="calendar-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              {t("events.emptyTitle")}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {t("events.emptyText")}
            </ThemedText>
          </View>
        }
      />

      {/* Create Event Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {t("events.createNew")}
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
              placeholder={t("events.form.title")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newEvent.title}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, title: text }))
              }
            />

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
              placeholder={t("events.form.location")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newEvent.location}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, location: text }))
              }
            />

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
              placeholder={t("events.form.date")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newEvent.date}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, date: text }))
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
              placeholder={t("events.form.description")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newEvent.description}
              onChangeText={(text) =>
                setNewEvent((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={createEventHandler}
            >
              <ThemedText style={styles.submitButtonText}>
                {t("events.createEvent")}
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
  deleteBtn: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailRowRTL: {
    flexDirection: "row-reverse",
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterRTL: {
    flexDirection: "row-reverse",
  },
  attendanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendanceContainerRTL: {
    flexDirection: "row-reverse",
  },
  attendanceText: {
    fontSize: 13,
    opacity: 0.7,
  },
  rsvpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rsvpText: {
    fontSize: 14,
    fontWeight: "600",
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
    height: 100,
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
