import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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

// FAQ data with translation keys
const faqs = [
  {
    id: "1",
    question: "help.faqs.howUpdateProfile",
    answer: "help.faqs.howUpdateProfileAnswer",
    category: "help.categories.account",
  },
  {
    id: "2",
    question: "help.faqs.whoPostAnnouncements",
    answer: "help.faqs.whoPostAnnouncementsAnswer",
    category: "help.categories.features",
  },
  {
    id: "3",
    question: "help.faqs.howContactSupport",
    answer: "help.faqs.howContactSupportAnswer",
    category: "help.categories.general",
  },
  {
    id: "4",
    question: "help.faqs.howResetPassword",
    answer: "help.faqs.howResetPasswordAnswer",
    category: "help.categories.account",
  },
  {
    id: "5",
    question: "help.faqs.whatDoIfAppCrashes",
    answer: "help.faqs.whatDoIfAppCrashesAnswer",
    category: "help.categories.troubleshooting",
  },
  {
    id: "6",
    question: "help.faqs.howReportInappropriate",
    answer: "help.faqs.howReportInappropriateAnswer",
    category: "help.categories.features",
  },
];

const SUPPORT_EMAIL = "support@communityapp.com";
const COMMUNITY_GUIDELINES_URL = "https://communityapp.com/guidelines";
const PRIVACY_POLICY_URL = "https://communityapp.com/privacy";

export default function HelpScreen() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>(
    "help.categories.all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

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

  // Get categories for filter
  const categories = [
    "help.categories.all",
    "help.categories.general",
    "help.categories.account",
    "help.categories.features",
    "help.categories.troubleshooting",
  ];

  // Filter FAQs based on category and search
  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "help.categories.all" ||
      faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      t(faq.question).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(faq.answer).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = async () => {
    const subject = encodeURIComponent(t("help.supportRequest"));
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), t("help.emailClientError"));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("help.emailOpenError"));
      console.error("Error opening email client:", error);
    }
  };

  const openExternalLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), t("help.linkOpenError"));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("help.linkOpenError"));
      console.error("Error opening link:", error);
    }
  };

  const renderFAQItem = (faq: any) => {
    const isExpanded = expandedItems.has(faq.id);
    const animatedValue = getAnimatedValue(faq.id);
    const height = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
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
          style={[
            styles.faqHeader,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.faqQuestionContainer,
              { alignItems: isRTL ? "flex-end" : "flex-start" },
            ]}
          >
            <Text
              style={[
                styles.faqQuestion,
                {
                  color: isDark ? "#fff" : "#333",
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
            >
              {t(faq.question)}
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
                {t(faq.category)}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={isDark ? "#ccc" : "#666"}
          />
        </TouchableOpacity>

        <Animated.View style={[styles.answerContainer, { height }]}>
          <Text
            style={[
              styles.faqAnswer,
              {
                color: isDark ? "#ccc" : "#555",
                textAlign: isRTL ? "right" : "left",
              },
            ]}
          >
            {t(faq.answer)}
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

  const getChevronIcon = () => {
    return isRTL ? "chevron-back" : "chevron-forward";
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
            {t("help.title")}
          </Text>
          <Text
            style={[styles.subheader, { color: themeColors.secondaryText }]}
          >
            {t("help.subtitle")}
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? "#2a2a2a" : "#f0f0f0",
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={themeColors.secondaryText}
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: themeColors.text,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={t("help.searchPlaceholder")}
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
          {categories.map((category) => (
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
                {t(category)}
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
                {searchQuery ? t("help.noResults") : t("help.noFAQs")}
              </Text>
              {searchQuery && (
                <Text
                  style={[
                    styles.emptySubtext,
                    { color: themeColors.secondaryText },
                  ]}
                >
                  {t("help.tryDifferentSearch")}
                </Text>
              )}
            </View>
          ) : (
            filteredFAQs.map(renderFAQItem)
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: themeColors.text,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
          >
            {t("help.quickActions")}
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
            onPress={handleContactSupport}
          >
            <Ionicons
              name={getChevronIcon()}
              size={18}
              color={themeColors.secondaryText}
            />
            <View
              style={[
                styles.actionTextContainer,
                { alignItems: isRTL ? "flex-end" : "flex-start" },
              ]}
            >
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                {t("help.contactSupport")}
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                {t("help.contactSupportDesc")}
              </Text>
            </View>
            <Ionicons
              name="mail-outline"
              size={22}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
            onPress={() => openExternalLink(COMMUNITY_GUIDELINES_URL)}
          >
            <Ionicons
              name={getChevronIcon()}
              size={18}
              color={themeColors.secondaryText}
            />
            <View
              style={[
                styles.actionTextContainer,
                { alignItems: isRTL ? "flex-end" : "flex-start" },
              ]}
            >
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                {t("help.communityGuidelines")}
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                {t("help.communityGuidelinesDesc")}
              </Text>
            </View>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={themeColors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                flexDirection: isRTL ? "row-reverse" : "row",
              },
            ]}
            onPress={() => openExternalLink(PRIVACY_POLICY_URL)}
          >
            <Ionicons
              name={getChevronIcon()}
              size={18}
              color={themeColors.secondaryText}
            />
            <View
              style={[
                styles.actionTextContainer,
                { alignItems: isRTL ? "flex-end" : "flex-start" },
              ]}
            >
              <Text style={[styles.actionTitle, { color: themeColors.text }]}>
                {t("help.privacyPolicy")}
              </Text>
              <Text
                style={[
                  styles.actionDescription,
                  { color: themeColors.secondaryText },
                ]}
              >
                {t("help.privacyPolicyDesc")}
              </Text>
            </View>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={themeColors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: themeColors.secondaryText }]}
          >
            {t("help.appVersion", { version: "1.0.0" })}
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  faqQuestionContainer: {
    flex: 1,
    marginHorizontal: 12,
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
