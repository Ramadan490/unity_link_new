// app/(tabs)/events.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  attending?: boolean;
  attendeesCount?: number;
};

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Community BBQ",
    date: "Sept 20, 2025",
    location: "Central Park",
    description: "Join us for our annual community BBQ with food, games, and fun activities for all ages!",
    attending: true,
    attendeesCount: 12,
  },
  {
    id: "2",
    title: "Board Meeting",
    date: "Sept 25, 2025",
    location: "Clubhouse",
    description: "Monthly board meeting to discuss community matters and upcoming initiatives.",
    attending: false,
    attendeesCount: 5,
  },
  {
    id: "3",
    title: "Memorial Service",
    date: "Oct 2, 2025",
    location: "Main Hall",
    description: "A special service to honor and remember our beloved community members.",
    attending: false,
    attendeesCount: 20,
  },
];

export default function EventsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageEvents = isSuperAdmin || isBoardMember;

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      Alert.alert(
        t("events.errors.missingInfo"),
        t("events.errors.fillFields")
      );
      return;
    }

    const newItem: Event = {
      id: Date.now().toString(),
      ...newEvent,
      attending: false,
      attendeesCount: 0,
    };
    setEvents((prev) => [newItem, ...prev]);
    setNewEvent({ title: "", date: "", location: "", description: "" });
    setModalVisible(false);
  };

  const deleteEvent = (id: string) => {
    Alert.alert(
      t("events.deleteConfirm"),
      t("events.deleteConfirmMsg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => setEvents((prev) => prev.filter((e) => e.id !== id)),
        },
      ]
    );
  };

  const toggleAttendance = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              attending: !event.attending,
              attendeesCount: event.attending
                ? Math.max(0, (event.attendeesCount || 0) - 1)
                : (event.attendeesCount || 0) + 1,
            }
          : event,
      ),
    );
  };

  const confirmToggleAttendance = (event: Event) => {
    if (event.attending) {
      Alert.alert(
        t("events.cancelAttendance"),
        t("events.cancelAttendanceMsg"),
        [
          { text: t("buttons.no"), style: "cancel" },
          {
            text: t("buttons.yes"),
            onPress: () => {
              toggleAttendance(event.id);
              if (detailModalVisible) {
                setDetailModalVisible(false);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        t("events.confirmAttendance"),
        t("events.confirmAttendanceMsg"),
        [
          { text: t("buttons.no"), style: "cancel" },
          {
            text: t("buttons.yes"),
            onPress: () => {
              toggleAttendance(event.id);
              if (detailModalVisible) {
                setDetailModalVisible(false);
              }
            },
          },
        ]
      );
    }
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      onPress={() => openEventDetails(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderLeftWidth: 4,
            borderLeftColor: item.attending
              ? "#34C759"
              : isDark
              ? "#333"
              : "#eee",
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text
            style={[styles.eventTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            {item.title}
          </Text>

          {canManageEvents && (
            <TouchableOpacity
              onPress={() => deleteEvent(item.id)}
              accessibilityLabel={`Delete ${item.title}`}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description preview */}
        {item.description && (
          <Text
            style={[
              styles.eventDescription,
              { color: isDark ? "#bbb" : "#666" },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <Text
              style={[styles.eventDetails, { color: isDark ? "#bbb" : "#555" }]}
            >
              {item.date}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <Text
              style={[styles.eventDetails, { color: isDark ? "#bbb" : "#555" }]}
            >
              {item.location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <Text
              style={[styles.eventDetails, { color: isDark ? "#bbb" : "#555" }]}
            >
              {item.attendeesCount || 0} {t("events.attending")}
            </Text>
          </View>
        </View>

        {/* RSVP Button */}
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            {
              backgroundColor: item.attending
                ? isDark
                  ? "#2C7A4A"
                  : "#34C759"
                : isDark
                ? "#2C2C2E"
                : "#F2F2F7",
              borderColor: item.attending
                ? "transparent"
                : isDark
                ? "#3A3A3C"
                : "#E5E5EA",
            },
          ]}
          onPress={() => confirmToggleAttendance(item)}
        >
          <Ionicons
            name={item.attending ? "checkmark-circle" : "add-circle-outline"}
            size={16}
            color={item.attending ? "#FFF" : isDark ? "#0A84FF" : "#007AFF"}
          />
          <Text
            style={[
              styles.rsvpButtonText,
              {
                color: item.attending ? "#FFF" : isDark ? "#0A84FF" : "#007AFF",
              },
            ]}
          >
            {item.attending ? t("events.attending") : t("events.rsvp")}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const eventCount = events.length;
  const eventText = t("events.count", { count: eventCount });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      {/* Header with Create Button */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}
            >
              {t("events.title")}
            </Text>
            {events.length > 0 && (
              <Text
                style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}
              >
                {eventText}
              </Text>
            )}
          </View>

          {canManageEvents && events.length > 0 && (
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
              ]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel={t("events.create")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>{t("events.create")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={isDark ? "#444" : "#ccc"}
          />
          <Text
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            {t("events.noEvents")}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canManageEvents
              ? t("events.emptyManage")
              : t("events.emptyView")}
          </Text>
          {canManageEvents && (
            <TouchableOpacity
              style={[
                styles.createFirstEventBtn,
                { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createFirstEventText}>
                {t("events.createFirst")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Event Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.detailModalBox,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.detailModalTitle,
                  { color: isDark ? "#fff" : "#333" },
                ]}
              >
                {t("events.details")}
              </Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <ScrollView style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailTitle,
                    { color: isDark ? "#fff" : "#333" },
                  ]}
                >
                  {selectedEvent.title}
                </Text>

                {selectedEvent.description && (
                  <Text
                    style={[
                      styles.detailDescription,
                      { color: isDark ? "#bbb" : "#666" },
                    ]}
                  >
                    {selectedEvent.description}
                  </Text>
                )}

                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    {selectedEvent.date}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    {selectedEvent.location}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    {selectedEvent.attendeesCount || 0} {t("events.attending")}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.detailRsvpButton,
                    {
                      backgroundColor: selectedEvent.attending
                        ? isDark
                          ? "#2C7A4A"
                          : "#34C759"
                        : isDark
                        ? "#0A84FF"
                        : "#007AFF",
                    },
                  ]}
                  onPress={() => confirmToggleAttendance(selectedEvent)}
                >
                  <Ionicons
                    name={
                      selectedEvent.attending
                        ? "checkmark-circle"
                        : "add-circle-outline"
                    }
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.detailRsvpButtonText}>
                    {selectedEvent.attending
                      ? t("events.attendingDetail")
                      : t("events.rsvpDetail")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Event Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModalBox,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.detailModalTitle,
                  { color: isDark ? "#fff" : "#333" },
                ]}
              >
                {t("events.createNew")}
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

            <ScrollView style={styles.createContent}>
              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                {t("events.form.title")}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
                  placeholder={t("events.form.titlePlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newEvent.title}
                  onChangeText={(text: string) =>
                    setNewEvent({ ...newEvent, title: text })
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                {t("events.form.date")}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
                  placeholder={t("events.form.datePlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newEvent.date}
                  onChangeText={(text: string) =>
                    setNewEvent({ ...newEvent, date: text })
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                {t("events.form.location")}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
                  placeholder={t("events.form.locationPlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newEvent.location}
                  onChangeText={(text: string) =>
                    setNewEvent({ ...newEvent, location: text })
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                {t("events.form.description")}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                    minHeight: 100,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: isDark ? "#fff" : "#000",
                      textAlignVertical: 'top',
                      paddingTop: 12,
                    }
                  ]}
                  placeholder={t("events.form.descriptionPlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newEvent.description}
                  onChangeText={(text: string) =>
                    setNewEvent({ ...newEvent, description: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.createSubmitButton,
                  { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
                ]}
                onPress={addEvent}
              >
                <Text style={styles.createSubmitButtonText}>
                  {t("events.buttons.create")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContent: { paddingHorizontal: 20, paddingVertical: 10 },
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
    marginBottom: 8,
  },
  eventTitle: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  eventDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  eventDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
  rsvpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  rsvpButtonText: { fontSize: 15, fontWeight: "600" },
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
  createFirstEventBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createFirstEventText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailModalBox: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  createModalBox: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.2)",
  },
  detailModalTitle: { fontSize: 18, fontWeight: "700" },
  closeButton: { padding: 4 },
  detailContent: { padding: 20 },
  createContent: { padding: 20 },
  detailTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  detailDescription: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  detailText: { fontSize: 16, fontWeight: "500" },
  detailRsvpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  detailRsvpButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
  createSubmitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  createSubmitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});