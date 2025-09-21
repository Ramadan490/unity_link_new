import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

// Categories for better organization
const FAQ_CATEGORIES = ["General", "Account", "Features", "Troubleshooting"];

const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I update my profile?",
    answer:
      "Go to the Profile tab and tap on 'Edit Profile' to update your personal information, profile picture, and other details. Changes are saved automatically.",
    category: "Account",
  },
  {
    id: "2",
    question: "Who can post announcements?",
    answer:
      "Board members and Super Admins can create and post announcements. Regular community members can view announcements but cannot create them.",
    category: "Features",
  },
  {
    id: "3",
    question: "How do I contact support?",
    answer:
      "You can contact our support team by using the 'Contact Support' button below to send us an email. We typically respond within 24 hours.",
    category: "General",
  },
  {
    id: "4",
    question: "How do I reset my password?",
    answer:
      "If you've forgotten your password, go to the login screen and tap 'Forgot Password'. You'll receive an email with instructions to reset your password.",
    category: "Account",
  },
  {
    id: "5",
    question: "What should I do if the app crashes?",
    answer:
      "Try restarting the app first. If the issue persists, make sure you have the latest version installed. You can also contact support with details about when the crash occurs.",
    category: "Troubleshooting",
  },
  {
    id: "6",
    question: "How do I report inappropriate content?",
    answer:
      "Use the report feature available on posts and comments, or contact support directly with details about the content you wish to report.",
    category: "Features",
  },
];

const SUPPORT_EMAIL = "support@communityapp.com";
const SUPPORT_SUBJECT = "App Support Request";
const COMMUNITY_GUIDELINES_URL = "https://communityapp.com/guidelines";
const PRIVACY_POLICY_URL = "https://communityapp.com/privacy";

export default function HelpScreen() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Animation values
  const animatedValues = React.useRef(new Map()).current;

  const getAnimatedValue = (id: string) => {
    if (!animatedValues.has(id)) {
      animatedValues.set(id, new Animated.Value(0));
    }
    return animatedValues.get(id);
  };

  const toggleExpand = (id: string) => {
    const isExpanded = expandedItems.has(id);
    const animatedValue = getAnimatedValue(id);

    if (isExpanded) {
      // Collapse
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => {
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    } else {
      // Expand
      setExpandedItems((prev) => new Set(prev).add(id));
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  // Filter FAQs based on category and search
  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      SUPPORT_SUBJECT,
    )}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Cannot open email client. Please set up an email account on your device.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error opening email client. Please try again.");
      console.error("Error opening email client:", error);
    }
  };

  const openExternalLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link. Please try again later.");
      }
    } catch (error) {
      Alert.alert("Error", "Error opening link. Please try again.");
      console.error("Error opening link:", error);
    }
  };

  const renderFAQItem = (faq: FAQ) => {
    const isExpanded = expandedItems.has(faq.id);
    const animatedValue = getAnimatedValue(faq.id);
    const height = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100], // Approximate height for answer
    });

    return (
      <View
        key={faq.id}
        style={[
          styles.faqCard,
          { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleExpand(faq.id)}
          style={styles.faqHeader}
          activeOpacity={0.7}
          accessibilityLabel={faq.question}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
        >
          <View style={styles.faqQuestionContainer}>
            <Text
              style={[
                styles.faqQuestion,
                { color: isDark ? "#fff" : "#333" },
              ]}
            >
              {faq.question}
            </Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: isDark ? "#333" : "#f0f0f0" },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isDark ? "#ccc" : "#666" },
                ]}
              >
                {faq.category}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={isDark ? "#ccc" : "#666"}
            accessibilityLabel={isExpanded ? "Collapse" : "Expand"}
          />
        </TouchableOpacity>

        <Animated.View style={[styles.answerContainer, { height }]}>
          <Text
            style={[styles.faqAnswer, { color: isDark ? "#ccc" : "#555" }]}
          >
            {faq.answer}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const themeColors = {
    background: isDark ? "#121212" : "#f9f9f9",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    primary: isDark ? "#0A84FF" : "#007AFF",
    border: isDark ? "#333" : "#e0e0e0",
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons
            name="help-circle-outline"
            size={32}
            color={themeColors.primary}
          />
          <Text style={[styles.header, { color: themeColors.text }]}>
            Help & Support
          </Text>
          <Text style={[styles.subheader, { color: themeColors.secondaryText }]}>
            Find answers to common questions or contact support for assistance
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0" },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={themeColors.secondaryText}
          />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search help articles..."
            placeholderTextColor={themeColors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={themeColors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {["All", ...FAQ_CATEGORIES].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                {
                  backgroundColor:
                    activeCategory === category
                      ? themeColors.primary
                      : themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  {
                    color:
                      activeCategory === category ? "#fff" : themeColors.text,
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <View style={styles.faqsContainer}>
          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={48}
                color={themeColors.secondaryText}
              />
              <Text
                style={[styles.emptyText, { color: themeColors.secondaryText }]}
              >
                {searchQuery ? "No results found" : "No FAQs available"}
              </Text>
              {searchQuery && (
                <Text
                  style={[
                    styles.emptySubtext,
                    { color: themeColors.secondaryText },
                  ]}
                >
                  Try a different search term or category
                </Text>
              )}
            </View>
          ) : (
            filteredFAQs.map(renderFAQItem)
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
            onPress={handleContactSupport}
          >
            <Ionicons
              name="mail-outline"
              size={22}
              color={themeColors.primary}
            />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                Contact Support
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                Get help from our support team
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={themeColors.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => openExternalLink(COMMUNITY_GUIDELINES_URL)}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={themeColors.primary}
            />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                Community Guidelines
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                Read our community rules and guidelines
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={themeColors.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
            onPress={() => openExternalLink(PRIVACY_POLICY_URL)}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={themeColors.primary}
            />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                Privacy Policy
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                Learn how we protect your data
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={themeColors.secondaryText}
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.secondaryText }]}>
            App Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  categoryContent: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  faqsContainer: {
    marginBottom: 24,
  },
  faqCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  answerContainer: {
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});
