// app/(tabs)/memorials.tsx
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

type Memorial = {
  id: string;
  name: string;
  date: string;
  description: string;
  author: string;
};

const initialMemorials: Memorial[] = [
  {
    id: "1",
    name: "John Doe",
    date: "Aug 15, 2025",
    description: "We gather to honor the life and memory of John, who brought joy and kindness to everyone he met.",
    author: "Community",
  },
  {
    id: "2",
    name: "Mary Smith",
    date: "Jul 20, 2025",
    description: "Mary will always be remembered for her dedication, love, and the positive impact she left on all of us.",
    author: "Family",
  },
];

export default function MemorialsScreen() {
  const [memorials, setMemorials] = useState<Memorial[]>(initialMemorials);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemorial, setNewMemorial] = useState({
    name: "",
    description: "",
    author: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  });
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  // ✅ Role checks
  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageMemorials = isSuperAdmin || isBoardMember;

  const addMemorial = () => {
    if (!newMemorial.name || !newMemorial.description || !newMemorial.author) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    const newItem: Memorial = {
      id: Date.now().toString(),
      ...newMemorial,
    };
    setMemorials((prev) => [newItem, ...prev]);
    setNewMemorial({
      name: "",
      description: "",
      author: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
    setModalVisible(false);
  };

  const deleteMemorial = (id: string) => {
    Alert.alert("Delete Memorial", "Are you sure you want to delete this memorial?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setMemorials((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  const openMemorialDetails = (memorial: Memorial) => {
    setSelectedMemorial(memorial);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: Memorial }) => (
    <TouchableOpacity onPress={() => openMemorialDetails(item)} activeOpacity={0.7}>
      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <Text style={[styles.memorialName, { color: isDark ? "#fff" : "#333" }]}>{item.name}</Text>

          {canManageMemorials && (
            <TouchableOpacity
              onPress={() => deleteMemorial(item.id)}
              accessibilityLabel={`Delete memorial for ${item.name}`}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description preview */}
        <Text style={[styles.memorialDescription, { color: isDark ? "#bbb" : "#666" }]} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.memorialDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={isDark ? "#0A84FF" : "#007AFF"} />
            <Text style={[styles.memorialDetails, { color: isDark ? "#bbb" : "#555" }]}>{item.author}</Text>
          </View>
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
            <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>Memorials</Text>
            {memorials.length > 0 && (
              <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
                {memorials.length} memorial{memorials.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {canManageMemorials && memorials.length > 0 && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Add new memorial"
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {memorials.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="rose-outline" size={64} color={isDark ? "#444" : "#ccc"} />
          <Text style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}>No memorials</Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canManageMemorials ? "Get started by creating your first memorial" : "Check back later for memorials"}
          </Text>
          {canManageMemorials && (
            <TouchableOpacity
              style={[styles.createFirstBtn, { backgroundColor: isDark ? "#0A84FF" : "#007AFF" }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createFirstBtnText}>Create Memorial</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={memorials}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Memorial Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalBox, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#333" }]}>Create New Memorial</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>Name *</Text>
                  <TextInput
                    placeholder="Enter name"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" }]}
                    value={newMemorial.name}
                    onChangeText={(t) => setNewMemorial((p) => ({ ...p, name: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>Author *</Text>
                  <TextInput
                    placeholder="Enter your name or group"
                    placeholderTextColor="#888"
                    style={[styles.input, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" }]}
                    value={newMemorial.author}
                    onChangeText={(t) => setNewMemorial((p) => ({ ...p, author: t }))}
                  />

                  <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333" }]}>Description *</Text>
                  <TextInput
                    placeholder="Write a tribute"
                    placeholderTextColor="#888"
                    style={[styles.input, styles.textArea, { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" }]}
                    multiline
                    numberOfLines={5}
                    value={newMemorial.description}
                    onChangeText={(t) => setNewMemorial((p) => ({ ...p, description: t }))}
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
                    style={[
                      styles.modalBtn,
                      styles.saveBtn,
                      { backgroundColor: newMemorial.name && newMemorial.description && newMemorial.author ? (isDark ? "#0A84FF" : "#007AFF") : (isDark ? "#444" : "#ccc") },
                    ]}
                    onPress={addMemorial}
                    disabled={!newMemorial.name || !newMemorial.description || !newMemorial.author}
                  >
                    <Text style={[styles.modalBtnText, { color: "#fff" }]}>Create Memorial</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Memorial Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModalBox, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.detailModalTitle, { color: isDark ? "#fff" : "#333" }]}>Memorial Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            {selectedMemorial && (
              <ScrollView style={styles.detailContent}>
                <Text style={[styles.detailTitle, { color: isDark ? "#fff" : "#333" }]}>{selectedMemorial.name}</Text>
                <Text style={[styles.detailDescription, { color: isDark ? "#bbb" : "#666" }]}>{selectedMemorial.description}</Text>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>{selectedMemorial.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="person-outline" size={20} color={isDark ? "#0A84FF" : "#007AFF"} />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>{selectedMemorial.author}</Text>
                </View>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "500" },
  createButton: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, gap: 6 },
  createButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingVertical: 10 },
  card: { padding: 20, borderRadius: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  memorialName: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  memorialDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  memorialDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 16 },
  emptyText: { fontSize: 16, textAlign: "center", marginTop: 8, lineHeight: 24 },
  createFirstBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, marginTop: 20, gap: 8 },
  createFirstBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalBox: { width: "100%", maxHeight: "80%", borderRadius: 20, overflow: "hidden" },
  detailModalBox: { width: "90%", maxHeight: "80%", borderRadius: 20, overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(150,150,150,0.2)" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  detailModalTitle: { fontSize: 18, fontWeight: "700" },
  closeButton: { padding: 4 },
  modalScroll: { maxHeight: 400, paddingHorizontal: 20 },
  inputLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: "500" },
  textArea: { height: 120, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(150,150,150,0.2)" },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, minWidth: 100, alignItems: "center" },
  cancelBtn: { backgroundColor: "#f2f2f7" },
  saveBtn: { backgroundColor: "#007AFF" },
  modalBtnText: { fontSize: 16, fontWeight: "600" },
  detailContent: { padding: 20 },
  detailTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  detailDescription: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  detailText: { fontSize: 16, fontWeight: "500" },
});
