// app/(tabs)/announcements.tsx
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

type Announcement = {
  id: string;
  title: string;
  date: string;
  content: string;
  author: string;
  priority?: "high" | "normal";
};

const initialAnnouncements: Announcement[] = [
  { 
    id: "1", 
    title: "Pool Maintenance", 
    date: "Sept 15, 2025", 
    content: "The community pool will be closed for maintenance from September 18-20. We apologize for any inconvenience.",
    author: "Management",
    priority: "high"
  },
  { 
    id: "2", 
    title: "New Security Measures", 
    date: "Sept 10, 2025", 
    content: "Starting next week, we will be implementing new security measures including additional cameras at all entry points.",
    author: "Security Team"
  },
  { 
    id: "3", 
    title: "Community Garden Update", 
    date: "Sept 5, 2025", 
    content: "The community garden renovation is complete! Sign up now for your plot. First come, first served.",
    author: "Recreation Committee"
  },
];

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: "", 
    content: "", 
    author: "",
    priority: "normal" as "high" | "normal"
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  // ✅ Role checks
  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageAnnouncements = isSuperAdmin || isBoardMember;

  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.author) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    const newItem: Announcement = { 
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...newAnnouncement
    };
    setAnnouncements((prev) => [newItem, ...prev]);
    setNewAnnouncement({ title: "", content: "", author: "", priority: "normal" });
    setModalVisible(false);
  };

  const deleteAnnouncement = (id: string) => {
    Alert.alert("Delete Announcement", "Are you sure you want to delete this announcement?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setAnnouncements((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  };

  const openAnnouncementDetails = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: Announcement }) => (
    <TouchableOpacity 
      onPress={() => openAnnouncementDetails(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.card, { 
        backgroundColor: isDark ? "#1e1e1e" : "#fff",
        borderLeftWidth: 4,
        borderLeftColor: item.priority === "high" ? "#FF3B30" : (isDark ? "#333" : "#eee")
      }]}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text style={[styles.announcementTitle, { color: isDark ? "#fff" : "#333" }]}>
            {item.title}
          </Text>

          {canManageAnnouncements && (
            <TouchableOpacity 
              onPress={() => deleteAnnouncement(item.id)} 
              accessibilityLabel={`Delete ${item.title}`}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content preview */}
        <Text 
          style={[styles.announcementContent, { color: isDark ? "#bbb" : "#666" }]}
          numberOfLines={3}
        >
          {item.content}
        </Text>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.announcementDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.author}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.announcementDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.date}</Text>
          </View>
          {item.priority === "high" && (
            <View style={styles.detailRow}>
              <Ionicons name="warning-outline" size={16} color="#FF3B30" />
              <Text style={[styles.announcementDetails, { color: "#FF3B30" }]}>High Priority</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      {/* Header with Create Button */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>Announcements</Text>
            {announcements.length > 0 && (
              <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
                {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          
          {canManageAnnouncements && announcements.length > 0 && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Add new announcement"
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="megaphone-outline" size={64} color={isDark ? "#444" : "#ccc"} />
          <Text style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}>
            No announcements
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canManageAnnouncements 
              ? "Get started by creating your first announcement" 
              : "Check back later for community updates"
            }
          </Text>
          {canManageAnnouncements && (
            <TouchableOpacity
              style={[styles.createFirstAnnouncementBtn, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createFirstAnnouncementText}>Create Announcement</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Announcement Modal */}
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
                    Create New Announcement
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
                    Title *
                  </Text>
                  <TextInput
                    placeholder="Enter announcement title"
                    placeholderTextColor="#888"
                    style={[styles.input, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7"
                    }]}
                    value={newAnnouncement.title}
                    onChangeText={(t) => setNewAnnouncement((p) => ({ ...p, title: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Author *
                  </Text>
                  <TextInput
                    placeholder="Enter your name or department"
                    placeholderTextColor="#888"
                    style={[styles.input, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7"
                    }]}
                    value={newAnnouncement.author}
                    onChangeText={(t) => setNewAnnouncement((p) => ({ ...p, author: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Content *
                  </Text>
                  <TextInput
                    placeholder="Enter announcement content"
                    placeholderTextColor="#888"
                    style={[styles.input, styles.textArea, { 
                      color: isDark ? "#fff" : "#000",
                      backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      height: 120,
                      textAlignVertical: 'top'
                    }]}
                    multiline
                    numberOfLines={5}
                    value={newAnnouncement.content}
                    onChangeText={(t) => setNewAnnouncement((p) => ({ ...p, content: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>
                    Priority
                  </Text>
                  <View style={styles.priorityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        newAnnouncement.priority === "normal" && styles.priorityButtonSelected,
                        { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" }
                      ]}
                      onPress={() => setNewAnnouncement((p) => ({ ...p, priority: "normal" }))}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        { color: isDark ? "#fff" : "#000" },
                        newAnnouncement.priority === "normal" && styles.priorityButtonTextSelected
                      ]}>
                        Normal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        newAnnouncement.priority === "high" && styles.priorityButtonSelected,
                        newAnnouncement.priority === "high" && { backgroundColor: "#FF3B30" }
                      ]}
                      onPress={() => setNewAnnouncement((p) => ({ ...p, priority: "high" }))}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        newAnnouncement.priority === "high" ? { color: "#fff" } : { color: isDark ? "#fff" : "#000" }
                      ]}>
                        High Priority
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                      backgroundColor: newAnnouncement.title && newAnnouncement.content && newAnnouncement.author
                        ? (isDark ? "#0A84FF" : "#007AFF") 
                        : (isDark ? "#444" : "#ccc")
                    }]} 
                    onPress={addAnnouncement}
                    disabled={!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.author}
                  >
                    <Text style={[styles.modalBtnText, { color: "#fff" }]}>Create Announcement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Announcement Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModalBox, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.detailModalTitle, { color: isDark ? "#fff" : "#333" }]}>
                Announcement Details
              </Text>
              <TouchableOpacity 
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
            
            {selectedAnnouncement && (
              <ScrollView style={styles.detailContent}>
                <Text style={[styles.detailTitle, { color: isDark ? "#fff" : "#333" }]}>
                  {selectedAnnouncement.title}
                </Text>
                
                <Text style={[styles.detailContentText, { color: isDark ? "#bbb" : "#666" }]}>
                  {selectedAnnouncement.content}
                </Text>
                
                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>
                    {selectedAnnouncement.author}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>
                    {selectedAnnouncement.date}
                  </Text>
                </View>
                
                {selectedAnnouncement.priority === "high" && (
                  <View style={styles.detailItem}>
                    <Ionicons name="warning-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.detailText, { color: "#FF3B30" }]}>
                      High Priority
                    </Text>
                  </View>
                )}
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
  announcementTitle: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  announcementContent: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  announcementDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
  emptyState: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    paddingHorizontal: 40
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  emptyText: { fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 24 },
  createFirstAnnouncementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8
  },
  createFirstAnnouncementText: { color: "#fff", fontWeight: "600", fontSize: 16 },
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
    height: 120,
    textAlignVertical: 'top'
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  priorityButtonSelected: {
    backgroundColor: '#007AFF'
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  priorityButtonTextSelected: {
    color: '#fff'
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
  detailContentText: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    gap: 12
  },
  detailText: { fontSize: 16, fontWeight: '500' },
});