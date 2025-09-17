import { Colors } from "@/constants/Colors";
import { Announcement } from "@/types/announcement";
import { formatDate } from "@/utils/formatDate";
import React from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

type Props = { announcement: Announcement };

export default function AnnouncementCard({ announcement }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>
        {announcement.title}
      </Text>

      {/* Content */}
      <Text style={[styles.content, { color: theme.secondaryText }]}>
        {announcement.content}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.meta, { color: theme.secondaryText }]}>
          {announcement.author} • {formatDate(announcement.date)}
        </Text>

        {announcement.category && (
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: theme.tint + "20" },
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.tint }]}>
              {announcement.category}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
