import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  I18nManager,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isRTL = i18n.language === "ar" || I18nManager.isRTL;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const themeColors = {
    background: isDark ? "#121212" : "#f9f9f9",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    border: isDark ? "#333" : "#e0e0e0",
    primary: isDark ? "#0A84FF" : "#007AFF",
    success: isDark ? "#30D158" : "#34C759",
  };

  const handleAccept = () => {
    console.log("✅ Terms Accepted");
    // Typically you would navigate to the next screen or update user preferences
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy-policy");
  };

  const openContact = () => {
    Linking.openURL("mailto:support@example.com");
  };

  const termsSections = [
    {
      title: t("help.terms.introduction.title"),
      content: t("help.terms.introduction.content"),
    },
    {
      title: t("help.terms.accounts.title"),
      content: t("help.terms.accounts.content"),
    },
    {
      title: t("help.terms.guidelines.title"),
      content: t("help.terms.guidelines.content"),
    },
    {
      title: t("help.terms.property.title"),
      content: t("help.terms.property.content"),
    },
    {
      title: t("help.terms.termination.title"),
      content: t("help.terms.termination.content"),
    },
    {
      title: t("help.terms.liability.title"),
      content: t("help.terms.liability.content"),
    },
    {
      title: t("help.terms.changes.title"),
      content: t("help.terms.changes.content"),
    },
    {
      title: t("help.terms.contact.title"),
      content: t("help.terms.contact.content"),
    },
  ];

  const lastUpdated = t("help.terms.lastUpdated");
  const appVersion = "v2.1.0";

  // RTL-aware styles
  const dynamicStyles = {
    container: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
    text: {
      textAlign: isRTL ? "right" : ("left" as "left" | "right"),
      writingDirection: isRTL ? "rtl" : ("ltr" as "ltr" | "rtl"),
    },
    header: {
      alignItems: "center" as const,
    },
    metaItem: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
    sectionHeader: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
    linkItem: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
    checkboxContainer: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
    button: {
      flexDirection: isRTL ? "row-reverse" : ("row" as "row" | "row-reverse"),
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, dynamicStyles.header]}>
          <Ionicons
            name="document-text-outline"
            size={32}
            color={themeColors.primary}
          />
          <Text
            style={[
              styles.headerTitle,
              { color: themeColors.text },
              dynamicStyles.text,
            ]}
          >
            {t("help.terms.title")}
          </Text>
          <Text
            style={[
              styles.subheader,
              { color: themeColors.secondaryText },
              dynamicStyles.text,
            ]}
          >
            {t("help.terms.subtitle")}
          </Text>
        </View>

        {/* Meta Information */}
        <View
          style={[styles.metaContainer, { backgroundColor: themeColors.card }]}
        >
          <View style={[styles.metaItem, dynamicStyles.metaItem]}>
            <Ionicons
              name="time-outline"
              size={16}
              color={themeColors.secondaryText}
            />
            <Text
              style={[
                styles.metaText,
                { color: themeColors.secondaryText },
                dynamicStyles.text,
              ]}
            >
              {t("help.terms.lastUpdatedLabel")}: {lastUpdated}
            </Text>
          </View>
          <View style={[styles.metaItem, dynamicStyles.metaItem]}>
            <Ionicons
              name="phone-portrait-outline"
              size={16}
              color={themeColors.secondaryText}
            />
            <Text
              style={[
                styles.metaText,
                { color: themeColors.secondaryText },
                dynamicStyles.text,
              ]}
            >
              {t("help.terms.versionLabel")}: {appVersion}
            </Text>
          </View>
        </View>

        {/* Terms Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.introText,
              { color: themeColors.text },
              dynamicStyles.text,
            ]}
          >
            {t("help.terms.welcome")}
          </Text>

          {termsSections.map((section, index) => (
            <View
              key={index}
              style={[styles.section, { backgroundColor: themeColors.card }]}
            >
              <TouchableOpacity
                style={[styles.sectionHeader, dynamicStyles.sectionHeader]}
                onPress={() => toggleSection(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: themeColors.text },
                    dynamicStyles.text,
                  ]}
                >
                  {section.title}
                </Text>
                <Ionicons
                  name={
                    expandedSections.has(index) ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color={themeColors.secondaryText}
                />
              </TouchableOpacity>

              {expandedSections.has(index) && (
                <Text
                  style={[
                    styles.sectionContent,
                    { color: themeColors.secondaryText },
                    dynamicStyles.text,
                  ]}
                >
                  {section.content}
                </Text>
              )}
            </View>
          ))}

          {/* Additional Links */}
          <View
            style={[
              styles.linksContainer,
              { backgroundColor: themeColors.card },
            ]}
          >
            <TouchableOpacity
              style={[styles.linkItem, dynamicStyles.linkItem]}
              onPress={openPrivacyPolicy}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text
                style={[
                  styles.linkText,
                  { color: themeColors.primary },
                  dynamicStyles.text,
                ]}
              >
                {t("help.terms.privacyPolicy")}
              </Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={themeColors.primary}
              />
            </TouchableOpacity>

            <View
              style={[styles.divider, { backgroundColor: themeColors.border }]}
            />

            <TouchableOpacity
              style={[styles.linkItem, dynamicStyles.linkItem]}
              onPress={openContact}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text
                style={[
                  styles.linkText,
                  { color: themeColors.primary },
                  dynamicStyles.text,
                ]}
              >
                {t("help.terms.contactSupport")}
              </Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={themeColors.primary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View
          style={[styles.footer, { backgroundColor: themeColors.background }]}
        >
          <TouchableOpacity
            style={[styles.checkboxContainer, dynamicStyles.checkboxContainer]}
            onPress={() => setAccepted(!accepted)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: themeColors.primary },
                accepted && [
                  styles.checkboxChecked,
                  { backgroundColor: themeColors.primary },
                ],
              ]}
            >
              {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: themeColors.text },
                dynamicStyles.text,
              ]}
            >
              {t("help.terms.agreement")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              dynamicStyles.button,
              {
                backgroundColor: accepted
                  ? themeColors.primary
                  : themeColors.border,
              },
            ]}
            onPress={handleAccept}
            disabled={!accepted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t("help.terms.continue")}</Text>
            <Ionicons
              name={isRTL ? "arrow-back" : "arrow-forward"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
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
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaItem: {
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  linksContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkItem: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
  },
  checkboxContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    borderColor: "transparent",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
