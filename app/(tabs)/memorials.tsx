// app/(tabs)/memorials.tsx
import { useRole } from "@/shared/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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
  dates: string;
  description: string;
  image?: string;
};

const initialMemorials: Memorial[] = [
  {
    id: "1",
    name: "John Smith",
    dates: "1950 - 2023",
    description:
      "Beloved father, husband, and community leader who served on the board for 10 years.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Mary Johnson",
    dates: "1945 - 2022",
    description:
      "Dedicated volunteer who organized community events and always had a smile for everyone.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Robert Davis",
    dates: "1938 - 2021",
    description:
      "Founding member of our community who helped establish many of the traditions we cherish today.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
];

export default function MemorialsScreen() {
  const [memorials, setMemorials] = useState<Memorial[]>(initialMemorials);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemorial, setNewMemorial] = useState({
    name: "",
    dates: "",
    description: "",
    image: "",
  });
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(
    null,
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  // ✅ Role checks
  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageMemorials = isSuperAdmin || isBoardMember;

  const addMemorial = () => {
    if (!newMemorial.name || !newMemorial.dates || !newMemorial.description) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    const newItem: Memorial = {
      id: Date.now().toString(),
      ...newMemorial,
    };
    setMemorials((prev) => [newItem, ...prev]);
    setNewMemorial({ name: "", dates: "", description: "", image: "" });
    setModalVisible(false);
  };

  const deleteMemorial = (id: string) => {
    Alert.alert(
      "Delete Memorial",
      "Are you sure you want to delete this memorial?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setMemorials((prev) => prev.filter((m) => m.id !== id)),
        },
      ],
    );
  };

  const openMemorialDetails = (memorial: Memorial) => {
    setSelectedMemorial(memorial);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: Memorial }) => (
    <TouchableOpacity
      onPress={() => openMemorialDetails(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
          },
        ]}
      >
        {/* Header row with image */}
        <View style={styles.cardHeader}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.memorialImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[styles.memorialImage, styles.memorialImagePlaceholder]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={isDark ? "#888" : "#ccc"}
              />
            </View>
          )}

          <View style={styles.memorialInfo}>
            <Text
              style={[styles.memorialName, { color: isDark ? "#fff" : "#333" }]}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.memorialDates,
                { color: isDark ? "#0A84FF" : "#007AFF" },
              ]}
            >
              {item.dates}
            </Text>
          </View>

          {canManageMemorials && (
            <TouchableOpacity
              onPress={() => deleteMemorial(item.id)}
              accessibilityLabel={`Delete ${item.name}`}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Description preview */}
        <Text
          style={[
            styles.memorialDescription,
            { color: isDark ? "#bbb" : "#666" },
          ]}
          numberOfLines={3}
        >
          {item.description}
        </Text>

        {/* View Details Button */}
        <TouchableOpacity
          style={[
            styles.viewDetailsButton,
            {
              backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
              borderColor: isDark ? "#3A3A3C" : "#E5E5EA",
            },
          ]}
          onPress={() => openMemorialDetails(item)}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={isDark ? "#0A84FF" : "#007AFF"}
          />
          <Text
            style={[
              styles.viewDetailsButtonText,
              { color: isDark ? "#0A84FF" : "#007AFF" },
            ]}
          >
            View Memorial
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
              In Memoriam
            </Text>
            {memorials.length > 0 && (
              <Text
                style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}
              >
                {memorials.length} memorial{memorials.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {canManageMemorials && memorials.length > 0 && (
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
              ]}
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
          <Ionicons
            name="heart-outline"
            size={64}
            color={isDark ? "#444" : "#ccc"}
          />
          <Text
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            No memorials yet
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666" }]}>
            {canManageMemorials
              ? "Honor community members by creating a memorial"
              : "Remembering those who have contributed to our community"}
          </Text>
          {canManageMemorials && (
            <TouchableOpacity
              style={[
                styles.createFirstMemorialBtn,
                { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createFirstMemorialText}>
                Create Memorial
              </Text>
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
                    Create Memorial
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

                <ScrollView style={styles.modalScroll}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Name *
                  </Text>
                  <TextInput
                    placeholder="Enter full name"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                    ]}
                    value={newMemorial.name}
                    onChangeText={(t) =>
                      setNewMemorial((p) => ({ ...p, name: t }))
                    }
                  />

                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Dates *
                  </Text>
                  <TextInput
                    placeholder="e.g. 1950 - 2023"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                    ]}
                    value={newMemorial.dates}
                    onChangeText={(t) =>
                      setNewMemorial((p) => ({ ...p, dates: t }))
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
                    placeholder="Share their story and contributions"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                        height: 120,
                        textAlignVertical: "top",
                      },
                    ]}
                    multiline
                    numberOfLines={5}
                    value={newMemorial.description}
                    onChangeText={(t) =>
                      setNewMemorial((p) => ({ ...p, description: t }))
                    }
                  />

                  <Text
                    style={[
                      styles.inputLabel,
                      { color: isDark ? "#fff" : "#333" },
                    ]}
                  >
                    Image URL (Optional)
                  </Text>
                  <TextInput
                    placeholder="Paste image URL"
                    placeholderTextColor="#888"
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7",
                      },
                    ]}
                    value={newMemorial.image}
                    onChangeText={(t) =>
                      setNewMemorial((p) => ({ ...p, image: t }))
                    }
                  />
                </ScrollView>

                {/* Modal actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.cancelBtn,
                      { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={[
                        styles.modalBtnText,
                        { color: isDark ? "#fff" : "#000" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.saveBtn,
                      {
                        backgroundColor:
                          newMemorial.name &&
                          newMemorial.dates &&
                          newMemorial.description
                            ? isDark
                              ? "#0A84FF"
                              : "#007AFF"
                            : isDark
                              ? "#444"
                              : "#ccc",
                      },
                    ]}
                    onPress={addMemorial}
                    disabled={
                      !newMemorial.name ||
                      !newMemorial.dates ||
                      !newMemorial.description
                    }
                  >
                    <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                      Create Memorial
                    </Text>
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
                Memorial Details
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

            {selectedMemorial && (
              <ScrollView style={styles.detailContent}>
                <View style={styles.detailImageContainer}>
                  {selectedMemorial.image ? (
                    <Image
                      source={{ uri: selectedMemorial.image }}
                      style={styles.detailImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.detailImage,
                        styles.detailImagePlaceholder,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={48}
                        color={isDark ? "#888" : "#ccc"}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.detailName,
                    { color: isDark ? "#fff" : "#333" },
                  ]}
                >
                  {selectedMemorial.name}
                </Text>

                <Text
                  style={[
                    styles.detailDates,
                    { color: isDark ? "#0A84FF" : "#007AFF" },
                  ]}
                >
                  {selectedMemorial.dates}
                </Text>

                <Text
                  style={[
                    styles.detailDescription,
                    { color: isDark ? "#bbb" : "#666" },
                  ]}
                >
                  {selectedMemorial.description}
                </Text>

                <View style={styles.memorialActions}>
                  <TouchableOpacity
                    style={[
                      styles.tributeButton,
                      {
                        backgroundColor: isDark ? "#0A84FF" : "#007AFF",
                      },
                    ]}
                  >
                    <Ionicons name="heart-outline" size={20} color="#FFF" />
                    <Text style={styles.tributeButtonText}>
                      Leave a Tribute
                    </Text>
                  </TouchableOpacity>
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
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  memorialImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f2f2f7",
  },
  memorialImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
  },
  memorialInfo: {
    flex: 1,
    justifyContent: "center",
  },
  memorialName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  memorialDates: { fontSize: 14, fontWeight: "500" },
  memorialDescription: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  deleteBtn: { padding: 4, alignSelf: "flex-start" },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  viewDetailsButtonText: { fontSize: 15, fontWeight: "600" },
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
  createFirstMemorialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createFirstMemorialText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  detailModalBox: {
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
  modalTitle: { fontSize: 20, fontWeight: "700" },
  detailModalTitle: { fontSize: 18, fontWeight: "700" },
  closeButton: { padding: 4 },
  modalScroll: { maxHeight: 400, paddingHorizontal: 20 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
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
  cancelBtn: { backgroundColor: "#f2f2f7" },
  saveBtn: { backgroundColor: "#007AFF" },
  modalBtnText: { fontSize: 16, fontWeight: "600" },
  detailContent: { padding: 20 },
  detailImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f2f2f7",
  },
  detailImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
  },
  detailName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  detailDates: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  memorialActions: {
    marginTop: 20,
  },
  tributeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  tributeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
