import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category?: string;
};

type UserRole = "superadmin" | "board" | "member";

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // ⚡ TODO: replace with context from TabsLayout
  const [role] = useState<UserRole>("member");

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Community Cleanup Event",
      content:
        "Join us this Saturday at 9AM for a neighborhood cleanup! Bring gloves and trash bags.",
      author: "Board Member John",
      date: "2025-09-10",
      category: "Event",
    },
    {
      id: "2",
      title: "Monthly HOA Meeting Reminder",
      content:
        "Next HOA meeting is scheduled for Sep 15, 2025 at 6PM in the community center.",
      author: "Super Admin Jane",
      date: "2025-09-08",
      category: "Meeting",
    },
    {
      id: "3",
      title: "Pool Maintenance Notice",
      content:
        "The community pool will be closed for maintenance from Sep 20-22. We apologize for any inconvenience.",
      author: "Board Member Sarah",
      date: "2025-09-05",
      category: "Maintenance",
    },
  ]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortNewest, setSortNewest] = useState(true);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Category options
  const categories = [
    "General",
    "Event",
    "Meeting",
    "Maintenance",
    "Social",
    "Urgent",
  ];

  // Derived announcements (search + filter + sort)
  const filteredAnnouncements = useMemo(() => {
    let list = announcements;

    if (searchQuery) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter) {
      list = list.filter((a) => a.category === activeFilter);
    }

    list = [...list].sort((a, b) =>
      sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );

    return list;
  }, [announcements, searchQuery, activeFilter, sortNewest]);

  // Add new announcement
  const handleAddAnnouncement = () => {
    if (!newTitle || !newContent) return;

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      author: role === "superadmin" ? "Super Admin" : "Board Member",
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      category: selectedCategory,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle("");
    setNewContent("");
    setSelectedCategory("General");
    setModalVisible(false);
    setSnackbar("Announcement posted!");
    setTimeout(() => setSnackbar(null), 3000);
  };

  // Delete announcement
  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    setSnackbar("Announcement deleted");
    setTimeout(() => setSnackbar(null), 3000);
  };

  // RSVP action
  const handleRSVP = (title: string) => {
    setSnackbar(`You RSVPed to "${title}"`);
    setTimeout(() => setSnackbar(null), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Announcements</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortNewest(!sortNewest)}
        >
          <Ionicons
            name={sortNewest ? "arrow-down-outline" : "arrow-up-outline"}
            size={20}
            color={theme.tint}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Search announcements..."
        placeholderTextColor={theme.secondaryText}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Filters */}
      <View style={styles.filterRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              { borderColor: theme.border },
              activeFilter === cat && {
                backgroundColor: theme.tint,
                borderColor: theme.tint,
              },
            ]}
            onPress={() => setActiveFilter(activeFilter === cat ? null : cat)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.text },
                activeFilter === cat && { color: "#fff", fontWeight: "600" },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List or Empty State */}
      {filteredAnnouncements.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="megaphone-outline"
            size={48}
            color={theme.secondaryText}
          />
          <Text
            style={[styles.emptyStateText, { color: theme.secondaryText }]}
          >
            No announcements found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnnouncements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderLeftColor: theme.tint },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.content, { color: theme.text }]}>
                {item.content}
              </Text>
              <Text style={[styles.meta, { color: theme.secondaryText }]}>
                {item.author} • {item.date}
              </Text>
              {item.category && (
                <Text style={[styles.category, { color: theme.tint }]}>
                  #{item.category}
                </Text>
              )}

              {/* ✅ Action buttons */}
              <View style={styles.cardActions}>
                {item.category === "Event" && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.tint },
                    ]}
                    onPress={() => handleRSVP(item.title)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={[styles.actionText, { color: "#fff" }]}>
                      RSVP
                    </Text>
                  </TouchableOpacity>
                )}

                {(role === "superadmin" || role === "board") && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: "#e53935", borderWidth: 1 },
                    ]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#e53935" />
                    <Text style={[styles.actionText, { color: "#e53935" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* FAB only for admins */}
      {(role === "superadmin" || role === "board") && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint }]}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Create New Announcement
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.text,
                },
              ]}
              placeholder="Title"
              placeholderTextColor={theme.secondaryText}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[
                styles.input,
                {
                  height: 100,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.text,
                },
              ]}
              placeholder="Content"
              placeholderTextColor={theme.secondaryText}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              textAlignVertical="top"
            />

            <Text
              style={[
                styles.meta,
                { marginBottom: 8, color: theme.secondaryText },
              ]}
            >
              Category:
            </Text>
            <View style={styles.filterRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterPill,
                    { borderColor: theme.border },
                    selectedCategory === cat && {
                      backgroundColor: theme.tint,
                      borderColor: theme.tint,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: theme.text },
                      selectedCategory === cat && {
                        color: "#294594ff",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.tint }]}
                onPress={handleAddAnnouncement}
              >
                <Text style={styles.addButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Snackbar */}
      {snackbar && (
        <View
          style={[
            styles.snackbar,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.snackbarText, { color: theme.text }]}>
            {snackbar}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  sortButton: { padding: 6, borderRadius: 6 },
  searchBar: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  filterText: { fontSize: 12 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },
  content: { fontSize: 15, marginBottom: 8, lineHeight: 20 },
  meta: { fontSize: 12, marginBottom: 4 },
  category: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  cardActions: { flexDirection: "row", marginTop: 8 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: { marginLeft: 4, fontSize: 13, fontWeight: "500" },
  fab: {
    position: "absolute",
    bottom: 70,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { padding: 20, borderRadius: 12, width: "85%", maxHeight: "80%" },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  addButtonText: { color: "#2b6fa3ff", fontWeight: "600" },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
  },
  cancelButtonText: { fontWeight: "600" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyStateText: { fontSize: 16, textAlign: "center", marginTop: 16 },
  snackbar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  snackbarText: { fontSize: 14, fontWeight: "500" },
});
