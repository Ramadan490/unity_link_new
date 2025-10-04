// app/(tabs)/memorials.tsx
import {
  addMemorial,
  deleteMemorial,
  getMemorials,
} from "@/features/memorials/services/memorialService";
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Memorial } from "@/types/memorial";
import { Ionicons } from "@expo/vector-icons";
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

export default function MemorialsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, isDark } = useTheme();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(
    null
  );
  const [newMemorial, setNewMemorial] = useState({
    name: "",
    description: "",
  });

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const insets = useSafeAreaInsets();
  const { isSuperAdmin, isBoardMember, user } = useRole();
  const canManageMemorials = isSuperAdmin || isBoardMember;
  const isRTL = i18n.language === "ar";

  // ✅ Safe user ID fallback
  const currentUserId = user?.id || "default-user-id-temp";

  // ✅ Load memorials with proper error handling and animations
  const fetchMemorials = useCallback(async () => {
    try {
      setError(null);
      const data = await getMemorials();
      setMemorials(data);

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
      console.error("Failed to load memorials:", err);
      setError(t("memorials.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, fadeAnim, slideAnim]);

  useEffect(() => {
    fetchMemorials();
  }, [fetchMemorials]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMemorials();
  }, [fetchMemorials]);

  const handleAddMemorial = async () => {
    if (!newMemorial.name.trim() || !newMemorial.description.trim()) {
      Alert.alert(t("error"), t("memorials.errors.fillAllFields"));
      return;
    }

    try {
      const created = await addMemorial({
        ...newMemorial,
        communityId: "default-community-id",
        createdById: currentUserId,
      });
      setMemorials((prev) => [created, ...prev]);
      setNewMemorial({ name: "", description: "" });
      setCreateModalVisible(false);
      Alert.alert(t("success"), t("memorials.createSuccess"));
    } catch (err) {
      console.error("Failed to create memorial:", err);
      Alert.alert(t("error"), t("memorials.errors.createFailed"));
    }
  };

  const handleDeleteMemorial = async (id: string, name: string) => {
    Alert.alert(
      t("memorials.deleteConfirm"),
      t("memorials.deleteConfirmMsg", { name }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMemorial(id);
              setMemorials((prev) => prev.filter((m) => m.id !== id));
            } catch (err) {
              console.error("Failed to delete memorial:", err);
              Alert.alert(t("error"), t("memorials.errors.deleteFailed"));
            }
          },
        },
      ]
    );
  };

  const openMemorialDetails = (memorial: Memorial) => {
    setSelectedMemorial(memorial);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderItem = ({ item, index }: { item: Memorial; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => openMemorialDetails(item)}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            marginTop: index === 0 ? 0 : 12,
          },
        ]}
      >
        <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
          <View style={styles.memorialIconContainer}>
            <Ionicons name="flower" size={24} color="#8E8E93" />
          </View>

          <View
            style={[styles.titleContainer, isRTL && styles.titleContainerRTL]}
          >
            <ThemedText type="defaultSemiBold" style={styles.memorialName}>
              {item.name}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.memorialDate}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>

          {canManageMemorials && (
            <TouchableOpacity
              onPress={() => handleDeleteMemorial(item.id, item.name)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {item.description && (
          <ThemedText
            type="default"
            style={[
              styles.memorialDescription,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            numberOfLines={3}
          >
            {item.description}
          </ThemedText>
        )}

        <TouchableOpacity
          style={[styles.readMoreBtn, isRTL && styles.readMoreBtnRTL]}
          onPress={() => openMemorialDetails(item)}
        >
          <ThemedText type="defaultSemiBold" style={styles.readMoreText}>
            {t("memorials.readMore")}
          </ThemedText>
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          {t("memorials.loading")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>
          {t("memorials.errorTitle")}
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={fetchMemorials}
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
            {t("memorials.title")}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={[styles.subtitle, isRTL && styles.textRTL]}
          >
            {t("memorials.subtitle", { count: memorials.length })}
          </ThemedText>
        </View>

        {canManageMemorials && (
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <ThemedText style={styles.createButtonText}>
              {t("memorials.create")}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Memorials List */}
      <Animated.FlatList
        data={memorials}
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
              name="flower-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              {t("memorials.emptyTitle")}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {t("memorials.emptyText")}
            </ThemedText>
          </View>
        }
      />

      {/* Create Memorial Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {t("memorials.createNew")}
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
              placeholder={t("memorials.form.name")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newMemorial.name}
              onChangeText={(text) =>
                setNewMemorial((prev) => ({ ...prev, name: text }))
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
              placeholder={t("memorials.form.description")}
              placeholderTextColor={theme.colors.textSecondary}
              value={newMemorial.description}
              onChangeText={(text) =>
                setNewMemorial((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleAddMemorial}
            >
              <ThemedText style={styles.submitButtonText}>
                {t("memorials.createMemorial")}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Memorial Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
            <ThemedText type="title" style={styles.modalTitle}>
              {t("memorials.details")}
            </ThemedText>
            <TouchableOpacity
              onPress={() => setDetailModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedMemorial && (
              <>
                <View
                  style={[styles.detailHeader, isRTL && styles.detailHeaderRTL]}
                >
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="flower" size={32} color="#8E8E93" />
                  </View>
                  <View
                    style={[
                      styles.detailTitleContainer,
                      isRTL && styles.detailTitleContainerRTL,
                    ]}
                  >
                    <ThemedText type="title" style={styles.detailName}>
                      {selectedMemorial.name}
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.detailDate}>
                      {formatDate(selectedMemorial.createdAt)}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText
                  type="default"
                  style={[
                    styles.detailDescription,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {selectedMemorial.description}
                </ThemedText>
              </>
            )}
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
  memorialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(142, 142, 147, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleContainerRTL: {
    marginRight: 0,
    marginLeft: 12,
    alignItems: "flex-end",
  },
  memorialName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  memorialDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  memorialDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  deleteBtn: {
    padding: 4,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
  },
  readMoreBtnRTL: {
    alignSelf: "flex-end",
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
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  detailHeaderRTL: {
    flexDirection: "row-reverse",
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(142, 142, 147, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailTitleContainer: {
    flex: 1,
  },
  detailTitleContainerRTL: {
    alignItems: "flex-end",
  },
  detailName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailDate: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  textRTL: {
    textAlign: "right",
  },
});
