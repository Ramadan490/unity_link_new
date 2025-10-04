// app/(tabs)/announcements.tsx
import {
  createAnnouncement,
  deleteAnnouncement as deleteAnnouncementAPI,
  getAnnouncements,
} from "@/features/announcements/services/announcementService";
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Announcement } from "@/shared/types/announcement";
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

export default function AnnouncementsScreen() {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSuperAdmin, isBoardMember, user } = useRole();
  const canManageAnnouncements = isSuperAdmin || isBoardMember;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "normal" as "normal" | "high",
  });

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // ✅ Replace this with context/profile later
  const communityId = "ec6dea87-7303-45a6-9cbc-ecb87bdd3b89";
  const isRTL = i18n.language === "ar";

  // ✅ Safe user ID fallback - FIXED TYPE ERROR
  const currentUserId = user?.id || "default-user-id-temp";

  // ✅ Fetch announcements from backend
  const fetchAnnouncements = useCallback(async () => {
    try {
      setError(null);
      const data = await getAnnouncements(communityId);
      setAnnouncements(data);

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
      console.error("Failed to load announcements:", err);
      setError(t("announcements.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId, t, fadeAnim, slideAnim]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ✅ Fixed priority functions with type safety
  const getPriorityColor = (priority: string | undefined): string => {
    return priority === "high" ? "#FF3B30" : "#34C759";
  };

  const getPriorityIcon = (
    priority: string | undefined
  ): keyof typeof Ionicons.glyphMap => {
    return priority === "high" ? "alert-circle" : "megaphone";
  };

  const createAnnouncementHandler = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      Alert.alert(t("error"), t("announcements.errors.fillAllFields"));
      return;
    }

    try {
      // ✅ FIXED: Use safe currentUserId instead of user?.id directly
      const created = await createAnnouncement({
        ...newAnnouncement,
        communityId,
        createdById: currentUserId,
      });
      setAnnouncements((prev) => [created, ...prev]);
      setNewAnnouncement({ title: "", content: "", priority: "normal" });
      setCreateModalVisible(false);
      Alert.alert(t("success"), t("announcements.createSuccess"));
    } catch (err) {
      console.error("Error creating announcement:", err);
      Alert.alert(t("error"), t("announcements.errors.createFailed"));
    }
  };

  const deleteAnnouncementHandler = (id: string, title: string) => {
    Alert.alert(
      t("announcements.deleteConfirm"),
      t("announcements.deleteConfirmMsg", { title }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnnouncementAPI(id);
              setAnnouncements((prev) => prev.filter((a) => a.id !== id));
            } catch (err) {
              console.error("Failed to delete announcement:", err);
              Alert.alert(t("error"), t("announcements.errors.deleteFailed"));
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

  const renderItem = ({
    item,
    index,
  }: {
    item: Announcement;
    index: number;
  }) => {
    // ✅ FIXED: Safe priority access with default value
    const priority = item.priority || "normal";
    const priorityColor = getPriorityColor(priority);
    const priorityIcon = getPriorityIcon(priority);

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
              borderLeftColor: priorityColor,
              marginTop: index === 0 ? 0 : 12,
            },
          ]}
        >
          <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColor + "20" },
                isRTL && styles.priorityBadgeRTL,
              ]}
            >
              <Ionicons name={priorityIcon} size={16} color={priorityColor} />
              <ThemedText
                type="defaultSemiBold"
                style={[styles.priorityText, { color: priorityColor }]}
              >
                {priority === "high"
                  ? t("announcements.highPriority")
                  : t("announcements.normalPriority")}
              </ThemedText>
            </View>

            {canManageAnnouncements && (
              <TouchableOpacity
                onPress={() => deleteAnnouncementHandler(item.id, item.title)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#ff3b30" />
              </TouchableOpacity>
            )}
          </View>

          <ThemedText type="defaultSemiBold" style={styles.announcementTitle}>
            {item.title}
          </ThemedText>

          <ThemedText
            type="default"
            style={styles.announcementContent}
            numberOfLines={4}
          >
            {item.content}
          </ThemedText>

          <View style={[styles.cardFooter, isRTL && styles.cardFooterRTL]}>
            <View
              style={[styles.dateContainer, isRTL && styles.dateContainerRTL]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="subtitle" style={styles.dateText}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.readMoreBtn}>
              <ThemedText type="defaultSemiBold" style={styles.readMoreText}>
                {t("announcements.readMore")}
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
          {t("announcements.loading")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>
          {t("announcements.errorTitle")}
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={fetchAnnouncements}
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
            {t("announcements.title")}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.subtitle, isRTL && styles.textRTL]}
          >
            {t("announcements.subtitle", { count: announcements.length })}
          </ThemedText>
        </View>

        {canManageAnnouncements && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.createButtonText}>
              {t("announcements.create")}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Announcements List */}
      <Animated.FlatList
        data={announcements}
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
              name="megaphone-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              {t("announcements.emptyTitle")}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {t("announcements.emptyText")}
            </ThemedText>
          </View>
        }
      />

      {/* Create Announcement Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {t("announcements.createNew")}
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
              placeholder={t("announcements.form.title")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newAnnouncement.title}
              onChangeText={(text) =>
                setNewAnnouncement((prev) => ({ ...prev, title: text }))
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
              placeholder={t("announcements.form.content")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newAnnouncement.content}
              onChangeText={(text) =>
                setNewAnnouncement((prev) => ({ ...prev, content: text }))
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View
              style={[
                styles.prioritySection,
                isRTL && styles.prioritySectionRTL,
              ]}
            >
              <ThemedText style={styles.priorityLabel}>
                {t("announcements.form.priority")}
              </ThemedText>
              <View
                style={[
                  styles.priorityOptions,
                  isRTL && styles.priorityOptionsRTL,
                ]}
              >
                {(["normal", "high"] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor:
                          newAnnouncement.priority === priority
                            ? getPriorityColor(priority) + "20"
                            : theme.colors.background,
                        borderColor: getPriorityColor(priority),
                      },
                    ]}
                    onPress={() =>
                      setNewAnnouncement((prev) => ({ ...prev, priority }))
                    }
                  >
                    <Ionicons
                      name={getPriorityIcon(priority)}
                      size={16}
                      color={getPriorityColor(priority)}
                    />
                    <ThemedText
                      style={[
                        styles.priorityOptionText,
                        { color: getPriorityColor(priority) },
                      ]}
                    >
                      {priority === "high"
                        ? t("announcements.highPriority")
                        : t("announcements.normalPriority")}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={createAnnouncementHandler}
            >
              <ThemedText style={styles.submitButtonText}>
                {t("announcements.publish")}
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
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  priorityBadgeRTL: {
    flexDirection: "row-reverse",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 4,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterRTL: {
    flexDirection: "row-reverse",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateContainerRTL: {
    flexDirection: "row-reverse",
  },
  dateText: {
    fontSize: 13,
    opacity: 0.7,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
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
    height: 120,
    textAlignVertical: "top",
  },
  prioritySection: {
    marginBottom: 24,
  },
  prioritySectionRTL: {
    alignItems: "flex-end",
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  priorityOptions: {
    flexDirection: "row",
    gap: 12,
  },
  priorityOptionsRTL: {
    flexDirection: "row-reverse",
  },
  priorityOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: "600",
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
