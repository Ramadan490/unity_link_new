// features/announcements/components/AnnouncementCard.tsx
import ThemedText from "@/shared/components/ui/ThemedText"; // ✅ fixed
import ThemedView from "@/shared/components/ui/ThemedView"; // ✅ fixed
import { useTheme } from "@/shared/context/ThemeContext";
import { Announcement } from "@/shared/types/announcement";
import { formatDate } from "@/shared/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  announcement: Announcement;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  onPress?: (announcement: Announcement) => void;
};

export default function AnnouncementCard({
  announcement,
  canDelete,
  onDelete,
  onPress,
}: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(announcement)}
    >
      <ThemedView
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderLeftWidth: 4,
            borderLeftColor:
              announcement.priority === "high"
                ? "#FF3B30"
                : theme.colors.border,
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {announcement.title}
          </ThemedText>

          {canDelete && (
            <TouchableOpacity
              onPress={() => onDelete?.(announcement.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ThemedText type="default" style={styles.content} numberOfLines={3}>
          {announcement.content}
        </ThemedText>

        {/* Footer */}
        <View style={styles.footer}>
          {announcement.author && (
            <View style={styles.footerItem}>
              <Ionicons
                name="person-outline"
                size={16}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.footerText}>
                {announcement.author}
              </ThemedText>
            </View>
          )}

          {announcement.date && (
            <View style={styles.footerItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.footerText}>
                {formatDate(announcement.date)}
              </ThemedText>
            </View>
          )}

          {announcement.category && (
            <View style={styles.footerItem}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={theme.colors.primary}
              />
              <ThemedText style={styles.footerText}>
                {announcement.category}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  content: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  footer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  footerItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  footerText: { fontSize: 13, marginLeft: 6 },
  deleteBtn: { padding: 4 },
});
