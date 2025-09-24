// app/(tabs)/announcements.tsx
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
    priority: "high",
  },
  {
    id: "2",
    title: "New Security Measures",
    date: "Sept 10, 2025",
    content: "Starting next week, we will be implementing new security measures including additional cameras at all entry points.",
    author: "Security Team",
  },
  {
    id: "3",
    title: "Community Garden Update",
    date: "Sept 5, 2025",
    content: "The community garden renovation is complete! Sign up now for your plot. First come, first served.",
    author: "Recreation Committee",
  },
];

export default function AnnouncementsScreen() {
  const { isRTL } = useTheme();
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    author: "",
    priority: "normal" as "high" | "normal",
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageAnnouncements = isSuperAdmin || isBoardMember;

  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !newAnnouncement.author) {
      Alert.alert(
        t("announcements.errors.missingInfo"),
        t("announcements.errors.fillFields")
      );
      return;
    }

    const newItem: Announcement = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      ...newAnnouncement,
    };
    setAnnouncements((prev) => [newItem, ...prev]);
    setNewAnnouncement({
      title: "",
      content: "",
      author: "",
      priority: "normal",
    });
    setModalVisible(false);
  };

  const deleteAnnouncement = (id: string) => {
    Alert.alert(
      t("announcements.deleteConfirm"),
      t("announcements.deleteConfirmMsg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => setAnnouncements((prev) => prev.filter((a) => a.id !== id)),
        },
      ],
    );
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
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderLeftWidth: 4,
            borderLeftColor: item.priority === "high" ? "#FF3B30" : theme.colors.border,
          },
        ]}
      >
        {/* Header row */}
        <View style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" style={styles.announcementTitle}>
            {item.title}
          </ThemedText>

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
        <ThemedText
          type="default"
          style={styles.announcementContent}
          numberOfLines={3}
        >
          {item.content}
        </ThemedText>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={theme.colors.primary}
            />
            <ThemedText type="default" style={styles.announcementDetails}>
              {item.author}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.primary}
            />
            <ThemedText type="default" style={styles.announcementDetails}>
              {item.date}
            </ThemedText>
          </View>
          {item.priority === "high" && (
            <View style={styles.detailRow}>
              <Ionicons name="warning-outline" size={16} color="#FF3B30" />
              <ThemedText
                type="default"
                style={[styles.announcementDetails, { color: "#FF3B30" }]}
              >
                {t("announcements.high")}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const announcementCount = announcements.length;
  const announcementText = t("announcements.count", { count: announcementCount });

  return (
    <ThemedView style={styles.container}>
      {/* Header with Create Button */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="title" style={styles.title}>
              {t("announcements.title")}
            </ThemedText>
            {announcements.length > 0 && (
              <ThemedText type="default" style={styles.subtitle}>
                {announcementText}
              </ThemedText>
            )}
          </View>

          {canManageAnnouncements && announcements.length > 0 && (
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel={t("announcements.create")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <ThemedText style={styles.createButtonText}>
                {t("announcements.create")}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="megaphone-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <ThemedText type="title" style={styles.emptyTitle}>
            {t("announcements.noAnnouncements")}
          </ThemedText>
          <ThemedText type="default" style={styles.emptyText}>
            {canManageAnnouncements
              ? t("announcements.emptyManage")
              : t("announcements.emptyView")}
          </ThemedText>
          {canManageAnnouncements && (
            <TouchableOpacity
              style={[
                styles.createFirstAnnouncementBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <ThemedText style={styles.createFirstAnnouncementText}>
                {t("announcements.createFirst")}
              </ThemedText>
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
              <View
                style={[
                  styles.modalBox,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText type="title" style={styles.modalTitle}>
                    {t("announcements.createNew")}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    {t("announcements.form.title")}
                  </ThemedText>
                  <TextInput
                    placeholder={t("announcements.form.titlePlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    value={newAnnouncement.title}
                    onChangeText={(t) =>
                      setNewAnnouncement((p) => ({ ...p, title: t }))
                    }
                  />

                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    {t("announcements.form.author")}
                  </ThemedText>
                  <TextInput
                    placeholder={t("announcements.form.authorPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    value={newAnnouncement.author}
                    onChangeText={(t) =>
                      setNewAnnouncement((p) => ({ ...p, author: t }))
                    }
                  />

                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    {t("announcements.form.content")}
                  </ThemedText>
                  <TextInput
                    placeholder={t("announcements.form.contentPlaceholder")}
                    placeholderTextColor={theme.colors.textSecondary}
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surface,
                        height: 120,
                        textAlignVertical: "top",
                      },
                    ]}
                    multiline
                    numberOfLines={5}
                    value={newAnnouncement.content}
                    onChangeText={(t) =>
                      setNewAnnouncement((p) => ({ ...p, content: t }))
                    }
                  />

                  <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                    {t("announcements.form.priority")}
                  </ThemedText>
                  <View style={styles.priorityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        newAnnouncement.priority === "normal" &&
                          styles.priorityButtonSelected,
                        { backgroundColor: theme.colors.surface },
                      ]}
                      onPress={() =>
                        setNewAnnouncement((p) => ({
                          ...p,
                          priority: "normal",
                        }))
                      }
                    >
                      <ThemedText
                        type="default"
                        style={[
                          styles.priorityButtonText,
                          newAnnouncement.priority === "normal" &&
                            styles.priorityButtonTextSelected,
                        ]}
                      >
                        {t("announcements.normal")}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        newAnnouncement.priority === "high" &&
                          styles.priorityButtonSelected,
                        newAnnouncement.priority === "high" && {
                          backgroundColor: "#FF3B30",
                        },
                      ]}
                      onPress={() =>
                        setNewAnnouncement((p) => ({ ...p, priority: "high" }))
                      }
                    >
                      <ThemedText
                        type="default"
                        style={[
                          styles.priorityButtonText,
                          newAnnouncement.priority === "high"
                            ? { color: "#fff" }
                            : { color: theme.colors.text },
                        ]}
                      >
                        {t("announcements.high")}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* Modal actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.cancelBtn,
                      { backgroundColor: theme.colors.surface },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <ThemedText type="default" style={styles.modalBtnText}>
                      {t("cancel")}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.saveBtn,
                      {
                        backgroundColor:
                          newAnnouncement.title &&
                          newAnnouncement.content &&
                          newAnnouncement.author
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                    onPress={addAnnouncement}
                    disabled={
                      !newAnnouncement.title ||
                      !newAnnouncement.content ||
                      !newAnnouncement.author
                    }
                  >
                    <ThemedText
                      type="default"
                      style={[styles.modalBtnText, { color: "#fff" }]}
                    >
                      {t("announcements.buttons.create")}
                    </ThemedText>
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
          <View
            style={[
              styles.detailModalBox,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.detailModalTitle}>
                {t("announcements.details")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedAnnouncement && (
              <ScrollView style={styles.detailContent}>
                <ThemedText type="title" style={styles.detailTitle}>
                  {selectedAnnouncement.title}
                </ThemedText>

                <ThemedText type="default" style={styles.detailContentText}>
                  {selectedAnnouncement.content}
                </ThemedText>

                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <ThemedText type="default" style={styles.detailText}>
                    {selectedAnnouncement.author}
                  </ThemedText>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <ThemedText type="default" style={styles.detailText}>
                    {selectedAnnouncement.date}
                  </ThemedText>
                </View>

                {selectedAnnouncement.priority === "high" && (
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color="#FF3B30"
                    />
                    <ThemedText
                      type="default"
                      style={[styles.detailText, { color: "#FF3B30" }]}
                    >
                      {t("announcements.high")}
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Your styles remain exactly the same - no changes needed!
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
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  announcementContent: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  announcementDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
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
  createFirstAnnouncementBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createFirstAnnouncementText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
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
  priorityContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  priorityButtonSelected: {
    backgroundColor: "#007AFF",
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  priorityButtonTextSelected: {
    color: "#fff",
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
  detailTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  detailContentText: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  detailText: { fontSize: 16, fontWeight: "500" },
});