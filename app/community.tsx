// app/community.tsx
import { ThemedText, ThemedView } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CommunityScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Header with Back Button */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>
          Community
        </ThemedText>

        {/* Empty view to balance the header */}
        <View style={styles.placeholder} />
      </View>

      {/* Community Content */}
      <View style={styles.content}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Connect with Others
        </ThemedText>
        <ThemedText type="default" style={styles.description}>
          Join our community to connect with fellow members, share experiences,
          and participate in discussions that matter to our community.
        </ThemedText>

        {/* Community Features */}
        <View
          style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="people-circle" size={32} color="#007A36" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Community Groups
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Join interest-based groups and connect with like-minded people
            </ThemedText>
          </View>
        </View>

        <View
          style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="chatbubbles" size={32} color="#6A0DAD" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Discussions
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Participate in community discussions and share your thoughts
            </ThemedText>
          </View>
        </View>

        <View
          style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="checkmark-circle" size={32} color="#D21034" />
          <View style={styles.featureText}>
            <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
              Voting
            </ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Participate in community decisions and make your voice heard
            </ThemedText>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[styles.divider, { backgroundColor: theme.colors.divider }]}
        />

        {/* Back to Home Button */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  placeholder: {
    width: 80,
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  homeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
