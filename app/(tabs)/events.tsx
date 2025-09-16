// app/(tabs)/events.tsx
import { useRole } from "@/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  attending?: boolean;
};

const initialEvents: Event[] = [
  { 
    id: "1", 
    title: "Community BBQ", 
    date: "Sept 20, 2025", 
    location: "Central Park",
    description: "Join us for our annual community BBQ with food, games, and fun activities for all ages!",
    attending: true
  },
  { 
    id: "2", 
    title: "Board Meeting", 
    date: "Sept 25, 2025", 
    location: "Clubhouse",
    description: "Monthly board meeting to discuss community matters and upcoming initiatives."
  },
  { 
    id: "3", 
    title: "Memorial Service", 
    date: "Oct 2, 2025", 
    location: "Main Hall",
    description: "A special service to honor and remember our beloved community members.",
    attending: false
  },
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: "", 
    date: "", 
    location: "", 
    description: "" 
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  // ✅ Role checks
  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageEvents = isSuperAdmin || isBoardMember;

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    const newItem: Event = { 
      id: Date.now().toString(), 
      ...newEvent,
      attending: false
    };
    setEvents((prev) => [newItem, ...prev]);
    setNewEvent({ title: "", date: "", location: "", description: "" });
    setModalVisible(false);
  };

  const deleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setEvents((prev) => prev.filter((e) => e.id !== id)),
      },
    ]);
  };

  const toggleAttendance = (id: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, attending: !event.attending } : event
    ));
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
      <View style={[styles.card, { 
        backgroundColor: isDark ? "#1e1e1e" : "#fff",
        borderLeftWidth: 4,
        borderLeftColor: item.attending ? "#34C759" : (isDark ? "#333" : "#eee")
      }]}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text style={[styles.eventTitle, { color: isDark ? "#fff" : "#333" }]}>
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
            style={[styles.eventDescription, { color: isDark ? "#bbb" : "#666" }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.eventDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.eventDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.location}</Text>
          </View>
        </View>

        {/* RSVP Button */}
        <TouchableOpacity
          style={[
            styles.rsvpButton, 
            { 
              backgroundColor: item.attending 
                ? (isDark ? "#2C7A4A" : "#34C759") 
                : (isDark ? "#2C2C2E" : "#F2F2F7"),
              borderColor: item.attending ? "transparent" : (isDark ? "#3A3A3C" : "#E5E5EA")
            }
          ]}
          onPress={() => toggleAttendance(item.id)}
        >
          <Ionicons 
            name={item.attending ? "checkmark-circle" : "add-circle-outline"} 
            size={16} 
            color={item.attending ? "#FFF" : (isDark ? "#0A84FF" : "#007AFF")} 
          />
          <Text style={[
            styles.rsvpButtonText, 
            { color: item.attending ? "#FFF" : (isDark ? "#0A84FF" : "#007AFF") }
          ]}>
            {item.attending ? "Attending" : "RSVP"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {/* Header with Create Button */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>Upcoming Events</Text>
            {events.length > 0 && (
              <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
                {events.length} event{events.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          {canManageEvents && events.length > 0 && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Add new event"
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={isDark ? "#444" : "#ccc"} />
          <Text style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}>
            No events scheduled
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canManageEvents 
              ? "Get started by creating your first event" 
              : "Check back later for upcoming events"
            }
          </Text>
          {canManageEvents && (
            <TouchableOpacity
              style={[styles.createFirstEventBtn, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createFirstEventText}>Create Event</Text>
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

      {/* Create Event Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalBox, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#333" }]}>
                    Create New Event
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Event Title *
                  </Text>
                  <TextInput
                    placeholder="Enter event title"
                    placeholderTextColor="#888"
                    style={[styles.input, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7"
                    }]}
                    value={newEvent.title}
                    onChangeText={(t) => setNewEvent((p) => ({ ...p, title: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Date *
                  </Text>
                  <TextInput
                    placeholder="e.g. Sept 20, 2025"
                    placeholderTextColor="#888"
                    style={[styles.input, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7"
                    }]}
                    value={newEvent.date}
                    onChangeText={(t) => setNewEvent((p) => ({ ...p, date: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Location *
                  </Text>
                  <TextInput
                    placeholder="Enter location"
                    placeholderTextColor="#888"
                    style={[styles.input, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7"
                    }]}
                    value={newEvent.location}
                    onChangeText={(t) => setNewEvent((p) => ({ ...p, location: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Description (Optional)
                  </Text>
                  <TextInput
                    placeholder="Describe the event"
                    placeholderTextColor="#888"
                    style={[styles.input, styles.textArea, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      height: 100,
                      textAlignVertical: 'top'
                    }]}
                    multiline
                    numberOfLines={4}
                    value={newEvent.description}
                    onChangeText={(t) => setNewEvent((p) => ({ ...p, description: t }))}
                  />
                </ScrollView>

                {/* Modal actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.cancelBtn, { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" }]} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.modalBtnText, { color: isDark ? "#fff" : "#000" }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.saveBtn, { 
                      backgroundColor: newEvent.title && newEvent.date && newEvent.location 
                        ? (isDark ? "#0A84FF" : "#007AFF") 
                        : (isDark ? "#444" : "#ccc")
                    }]} 
                    onPress={addEvent}
                    disabled={!newEvent.title || !newEvent.date || !newEvent.location}
                  >
                    <Text style={[styles.modalBtnText, { color: "#fff" }]}>Create Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Event Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModalBox, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.detailModalTitle, { color: isDark ? "#fff" : "#333" }]}>
                Event Details
              </Text>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <ScrollView style={styles.detailContent}>
                <Text style={[styles.detailTitle, { color: isDark ? "#fff" : "#333" }]}>
                  {selectedEvent.title}
                </Text>
                
                {selectedEvent.description && (
                  <Text style={[styles.detailDescription, { color: isDark ? "#bbb" : "#666" }]}>
                    {selectedEvent.description}
                  </Text>
                )}
                
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>
                    {selectedEvent.date}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>
                    {selectedEvent.location}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.detailRsvpButton, 
                    { 
                      backgroundColor: selectedEvent.attending 
                        ? (isDark ? "#2C7A4A" : "#34C759") 
                        : (isDark ? "#0A84FF" : "#007AFF")
                    }
                  ]}
                  onPress={() => {
                    toggleAttendance(selectedEvent.id);
                    setDetailModalVisible(false);
                  }}
                >
                  <Ionicons 
                    name={selectedEvent.attending ? "checkmark-circle" : "add-circle-outline"} 
                    size={20} 
                    color="#FFF" 
                  />
                  <Text style={styles.detailRsvpButtonText}>
                    {selectedEvent.attending ? "You're Attending" : "RSVP to this Event"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    marginBottom: 8 
  },
  eventTitle: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  eventDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  eventDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 6
  },
  rsvpButtonText: { fontSize: 15, fontWeight: "600" },
  emptyState: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    paddingHorizontal: 40
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  emptyText: { fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 24 },
  createFirstEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8
  },
  createFirstEventText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: { flex: 1 },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20
  },
  modalBox: { 
    width: "100%", 
    maxHeight: "80%",
    borderRadius: 20,
    overflow: 'hidden'
  },
  detailModalBox: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)'
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  detailModalTitle: { fontSize: 18, fontWeight: "700" },
  closeButton: { padding: 4 },
  modalScroll: { maxHeight: 400, paddingHorizontal: 20 },
  inputLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  modalActions: { 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)'
  },
  modalBtn: { 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center'
  },
  cancelBtn: { backgroundColor: '#f2f2f7' },
  saveBtn: { backgroundColor: '#007AFF' },
  modalBtnText: { fontSize: 16, fontWeight: "600" },
  detailContent: { padding: 20 },
  detailTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  detailDescription: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    gap: 12
  },
  detailText: { fontSize: 16, fontWeight: '500' },
  detailRsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8
  },
  detailRsvpButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
});