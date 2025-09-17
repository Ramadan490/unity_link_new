// app/(tabs)/home.tsx
import ThemedText from "@/shared/components/ui/ThemedText";
import ThemedView from "@/shared/components/ui/ThemedView";
import { useRole } from "@/shared/hooks/useRole";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { isSuperAdmin, isBoardMember } = useRole();
  const router = useRouter();
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const insets = useSafeAreaInsets();

  // 🔹 State for dynamic content
  const [announcements, setAnnouncements] = useState<number>(0);
  const [nextEvent, setNextEvent] = useState<string | null>(null);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [pendingRequests, setPendingRequests] = useState<number>(0);

  // 🔹 Simulate fetching from backend
  useEffect(() => {
    setTimeout(() => {
      setAnnouncements(2);
      setNextEvent("HOA meeting Sept 20");
      setMembersCount(128);
      setPendingRequests(3);
    }, 800);
  }, []);

  const goTo = (path: Href) => router.push(path);

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#121212" : "#fff",
          paddingTop: insets.top + 20,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <ThemedText
              type="title"
              style={[styles.header, { color: isDark ? "#fff" : "#2f4053" }]}
            >
              👋 Sudanese American Center in Arizona
            </ThemedText>
            <ThemedText
              type="label"
              style={[styles.subheader, { color: isDark ? "#aaa" : "#666" }]}
            >
              Here’s what’s happening in your community
            </ThemedText>
          </View>
        </View>

        {/* Quick Highlights */}
        <View style={styles.row}>
          {/* Announcements */}
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
            activeOpacity={0.85}
            onPress={() => goTo("/(tabs)/announcements" as Href)}
            accessibilityLabel="View latest announcements"
          >
            <Ionicons
              name="megaphone-outline"
              size={28}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Announcements
            </ThemedText>
            <ThemedText
              style={[styles.cardInfo, { color: isDark ? "#bbb" : "#666" }]}
            >
              {announcements} update{announcements !== 1 && "s"} this week
            </ThemedText>
            <ThemedText style={styles.linkText}>See all →</ThemedText>
          </TouchableOpacity>

          {/* Events */}
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
            ]}
            activeOpacity={0.85}
            onPress={() => goTo("/(tabs)/events" as Href)}
            accessibilityLabel="View upcoming events"
          >
            <Ionicons name="calendar-outline" size={28} color="#34C759" />
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Events
            </ThemedText>
            <ThemedText
              style={[styles.cardInfo, { color: isDark ? "#bbb" : "#666" }]}
            >
              {nextEvent ?? "No upcoming events"}
            </ThemedText>
            <ThemedText style={styles.linkText}>See all →</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Community Info */}
        <TouchableOpacity
          style={[
            styles.bigCard,
            { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
          ]}
          activeOpacity={0.85}
          onPress={() => goTo("/(tabs)/memorials" as Href)}
          accessibilityLabel="View memorials"
        >
          <Ionicons name="flower-outline" size={28} color="#FF9500" />
          <View style={{ marginLeft: 12 }}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Memorials
            </ThemedText>
            <ThemedText
              style={[styles.cardInfo, { color: isDark ? "#bbb" : "#666" }]}
            >
              Remember and honor community members
            </ThemedText>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={isDark ? "#0A84FF" : "#007AFF"}
            />
            <ThemedText
              style={[styles.statText, { color: isDark ? "#fff" : "#333" }]}
            >
              {membersCount} Members
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" },
            ]}
          >
            <Ionicons name="document-text-outline" size={20} color="#34C759" />
            <ThemedText
              style={[styles.statText, { color: isDark ? "#fff" : "#333" }]}
            >
              {pendingRequests} Requests Pending
            </ThemedText>
          </View>
        </View>

        {/* Role-Specific Actions */}
        {(isSuperAdmin || isBoardMember) && (
          <View style={{ marginTop: 28 }}>
            <ThemedText
              type="subtitle"
              style={[{ marginBottom: 12, color: isDark ? "#fff" : "#2f4053" }]}
            >
              Board Tools
            </ThemedText>

            <TouchableOpacity
              style={[
                styles.bigCard,
                { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
              ]}
              activeOpacity={0.85}
              onPress={() => goTo("/(tabs)/requests" as Href)}
              accessibilityLabel="Manage resident requests"
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#5856D6"
              />
              <View style={{ marginLeft: 12 }}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  Manage Requests
                </ThemedText>
                <ThemedText
                  style={[styles.cardInfo, { color: isDark ? "#bbb" : "#666" }]}
                >
                  Review pending resident requests
                </ThemedText>
              </View>
            </TouchableOpacity>

            {isSuperAdmin && (
              <TouchableOpacity
                style={[
                  styles.bigCard,
                  { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
                ]}
                activeOpacity={0.85}
                onPress={() => goTo("/(tabs)/manageUsers" as Href)}
                accessibilityLabel="Manage users"
              >
                <Ionicons name="people-outline" size={24} color="#FF2D55" />
                <View style={{ marginLeft: 12 }}>
                  <ThemedText type="subtitle" style={styles.cardTitle}>
                    Manage Users
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.cardInfo,
                      { color: isDark ? "#bbb" : "#666" },
                    ]}
                  >
                    Add, remove, or edit user roles
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { marginBottom: 20 },
  header: { fontSize: 26, fontWeight: "800" },
  subheader: { fontSize: 14, marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { marginTop: 8, fontWeight: "600" },
  cardInfo: { marginTop: 4, fontSize: 13 },
  linkText: { marginTop: 6, fontSize: 12, fontWeight: "500", color: "#007AFF" },
  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  statText: { marginLeft: 8, fontSize: 13, fontWeight: "500" },
});
