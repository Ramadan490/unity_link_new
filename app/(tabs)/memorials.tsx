// app/(tabs)/memorials.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { useRole } from "@/shared/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Memorial = {
  id: string;
  name: string;
  dates: string;
  description: string;
  image?: string;
  tributeCount?: number;
};

const initialMemorials: Memorial[] = [
  {
    id: "1",
    name: "John Smith",
    dates: "1950 - 2023",
    description: "Beloved father, husband, and community leader who served on the board for 10 years. His dedication to preserving Sudanese culture inspired many.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    tributeCount: 24,
  },
  {
    id: "2",
    name: "Mary Johnson",
    dates: "1945 - 2022",
    description: "Dedicated volunteer who organized community events and always had a smile for everyone. She helped establish our annual cultural festival.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    tributeCount: 18,
  },
  {
    id: "3",
    name: "Robert Davis",
    dates: "1938 - 2021",
    description: "Founding member of our community who helped establish many of the traditions we cherish today. His wisdom guided us for decades.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    tributeCount: 32,
  },
];

export default function MemorialsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  const [memorials, setMemorials] = useState<Memorial[]>(initialMemorials);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemorial, setNewMemorial] = useState({
    name: "",
    dates: "",
    description: "",
    image: "",
  });
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  const { isSuperAdmin, isBoardMember } = useRole();
  const canManageMemorials = isSuperAdmin || isBoardMember;

  const addMemorial = () => {
    if (!newMemorial.name || !newMemorial.dates || !newMemorial.description) {
      Alert.alert(t("memorials.missingInfo"), t("memorials.fillAllFields"));
      return;
    }

    const newItem: Memorial = {
      id: Date.now().toString(),
      ...newMemorial,
      tributeCount: 0,
    };
    setMemorials((prev) => [newItem, ...prev]);
    setNewMemorial({ name: "", dates: "", description: "", image: "" });
    setModalVisible(false);
  };

  const deleteMemorial = (id: string) => {
    Alert.alert(
      t("memorials.deleteConfirm"),
      t("memorials.deleteConfirmMsg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => setMemorials((prev) => prev.filter((m) => m.id !== id)),
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
            borderLeftWidth: 4,
            borderLeftColor: isDark ? "#333" : "#eee",
          },
        ]}
      >
        {/* Header row */}
        <View style={[styles.cardHeader, isRTL && { flexDirection: "row-reverse" }]}>
          <View style={[styles.titleContainer, isRTL && { alignItems: "flex-end", marginRight: 0, marginLeft: 12 }]}>
            <Text style={[styles.memorialName, { color: isDark ? "#fff" : "#333" }]}>
              {item.name}
            </Text>
            <Text style={[styles.memorialDates, { color: isDark ? "#0A84FF" : "#007AFF" }]}>
              {item.dates}
            </Text>
          </View>

          {canManageMemorials && (
            <TouchableOpacity
              onPress={() => deleteMemorial(item.id)}
              accessibilityLabel={t("memorials.deleteConfirm")}
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
              styles.memorialDescription,
              { 
                color: isDark ? "#bbb" : "#666",
                textAlign: isRTL ? "right" : "left"
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={[styles.detailRow, isRTL && { flexDirection: "row-reverse" }]}>
            <Ionicons
              name="heart-outline"
              size={16}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <Text
              style={[
                styles.memorialDetails,
                { 
                  color: isDark ? "#bbb" : "#555",
                  marginLeft: isRTL ? 0 : 8,
                  marginRight: isRTL ? 8 : 0
                },
              ]}
            >
              {t("memorials.tribute")}
            </Text>
          </View>

          {item.image && (
            <View style={[styles.detailRow, isRTL && { flexDirection: "row-reverse" }]}>
              <Ionicons
                name="image-outline"
                size={16}
                color={isDark ? "#0A84FF" : "#007AFF"}
              />
              <Text
                style={[
                  styles.memorialDetails,
                  { 
                    color: isDark ? "#bbb" : "#555",
                    marginLeft: isRTL ? 0 : 8,
                    marginRight: isRTL ? 8 : 0
                  },
                ]}
              >
                {t("photo")}
              </Text>
            </View>
          )}
        </View>

        {/* View Memorial Button */}
        <TouchableOpacity
          style={[
            styles.viewButton,
            {
              backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
              borderColor: isDark ? "#3A3A3C" : "#E5E5EA",
              flexDirection: isRTL ? "row-reverse" : "row",
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
              styles.viewButtonText,
              { 
                color: isDark ? "#0A84FF" : "#007AFF",
                marginLeft: isRTL ? 0 : 6,
                marginRight: isRTL ? 6 : 0
              },
            ]}
          >
            {t("memorials.details")}
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
        <View style={[styles.headerRow, isRTL && { flexDirection: "row-reverse" }]}>
          <View style={isRTL && { alignItems: "flex-end" }}>
            <Text style={[styles.title, { color: isDark ? "#fff" : "#2f4053" }]}>
              {t("tabs.memorials")}
            </Text>
            {memorials.length > 0 && (
              <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
                {t("memorials.count", { count: memorials.length })}
              </Text>
            )}
          </View>

          {canManageMemorials && memorials.length > 0 && (
            <TouchableOpacity
              style={[
                styles.createButton,
                { 
                  backgroundColor: isDark ? "#0A84FF" : "#007AFF",
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel={t("buttons.createMemorial")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={[styles.createButtonText, isRTL && { marginRight: 6, marginLeft: 0 }]}>
                {t("buttons.create")}
              </Text>
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
          <Text style={[styles.emptyTitle, { color: isDark ? "#fff" : "#333" }]}>
            {t("memorials.noMemorials")}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#aaa" : "#666", textAlign: "center" }]}>
            {canManageMemorials
              ? t("memorials.emptyManage")
              : t("memorials.emptyView")}
          </Text>
          {canManageMemorials && (
            <TouchableOpacity
              style={[
                styles.createFirstMemorialBtn,
                { 
                  backgroundColor: isDark ? "#0A84FF" : "#007AFF",
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={[styles.createFirstMemorialText, isRTL && { marginRight: 8, marginLeft: 0 }]}>
                {t("memorials.createFirst")}
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

      {/* Memorial Detail Modal */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.detailModalBox,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <View style={[styles.modalHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={[styles.detailModalTitle, { color: isDark ? "#fff" : "#333" }]}>
                {t("memorials.details")}
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
                {selectedMemorial.image && (
                  <View style={styles.detailImageContainer}>
                    <Image
                      source={{ uri: selectedMemorial.image }}
                      style={styles.detailImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <Text style={[styles.detailName, { color: isDark ? "#fff" : "#333" }]}>
                  {selectedMemorial.name}
                </Text>

                <Text style={[styles.detailDates, { color: isDark ? "#0A84FF" : "#007AFF" }]}>
                  {selectedMemorial.dates}
                </Text>

                {selectedMemorial.description && (
                  <Text style={[styles.detailDescription, { color: isDark ? "#bbb" : "#666", textAlign: "center" }]}>
                    {selectedMemorial.description}
                  </Text>
                )}

                <View style={[styles.detailItem, isRTL && { flexDirection: "row-reverse" }]}>
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={isDark ? "#0A84FF" : "#007AFF"}
                  />
                  <Text style={[styles.detailText, { color: isDark ? "#fff" : "#333" }]}>
                    {t("memorials.tribute")}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.tributeButton,
                    { 
                      backgroundColor: isDark ? "#0A84FF" : "#007AFF",
                      flexDirection: isRTL ? "row-reverse" : "row",
                    },
                  ]}
                >
                  <Ionicons name="heart-outline" size={20} color="#FFF" />
                  <Text style={[styles.tributeButtonText, isRTL && { marginRight: 8, marginLeft: 0 }]}>
                    {t("memorials.tribute")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Memorial Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.createModalBox,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
          >
            <View style={[styles.modalHeader, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={[styles.detailModalTitle, { color: isDark ? "#fff" : "#333" }]}>
                {t("memorials.createNew")}
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
              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333", textAlign: isRTL ? "right" : "left" }]}>
                {t("memorials.form.name")} *
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? "#fff" : "#000",
                    textAlign: isRTL ? "right" : "left"
                  }]}
                  placeholder={t("memorials.form.namePlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newMemorial.name}
                  onChangeText={(text: string) =>
                    setNewMemorial({ ...newMemorial, name: text })
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333", textAlign: isRTL ? "right" : "left" }]}>
                {t("memorials.form.dates")} *
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? "#fff" : "#000",
                    textAlign: isRTL ? "right" : "left"
                  }]}
                  placeholder={t("memorials.form.datesPlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newMemorial.dates}
                  onChangeText={(text: string) =>
                    setNewMemorial({ ...newMemorial, dates: text })
                  }
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333", textAlign: isRTL ? "right" : "left" }]}>
                {t("memorials.form.description")} *
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
                      textAlignVertical: "top",
                      paddingTop: 12,
                      textAlign: isRTL ? "right" : "left"
                    },
                  ]}
                  placeholder={t("memorials.form.descriptionPlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newMemorial.description}
                  onChangeText={(text: string) =>
                    setNewMemorial({ ...newMemorial, description: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Text style={[styles.inputLabel, { color: isDark ? "#fff" : "#333", textAlign: isRTL ? "right" : "left" }]}>
                {t("memorials.form.image")}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: isDark ? "#2c2c2e" : "#f2f2f7" },
                ]}
              >
                <TextInput
                  style={[styles.input, { 
                    color: isDark ? "#fff" : "#000",
                    textAlign: isRTL ? "right" : "left"
                  }]}
                  placeholder={t("memorials.form.imagePlaceholder")}
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={newMemorial.image}
                  onChangeText={(text: string) =>
                    setNewMemorial({ ...newMemorial, image: text })
                  }
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.createSubmitButton,
                  { backgroundColor: isDark ? "#0A84FF" : "#007AFF" },
                ]}
                onPress={addMemorial}
              >
                <Text style={styles.createSubmitButtonText}>
                  {t("memorials.buttons.create")}
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
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  memorialName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  memorialDates: { fontSize: 14, fontWeight: "500" },
  memorialDescription: { fontSize: 14, marginBottom: 12, lineHeight: 20 },
  detailsContainer: { marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  memorialDetails: { fontSize: 14, marginLeft: 8 },
  deleteBtn: { padding: 4 },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  viewButtonText: { fontSize: 15, fontWeight: "600" },
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
  detailImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  detailName: {
    fontSize: 22,
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
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    justifyContent: "center",
  },
  detailText: { fontSize: 16, fontWeight: "500" },
  tributeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  tributeButtonText: {
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