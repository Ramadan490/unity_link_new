import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  const [accepted, setAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0]),
  );
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      title: "1. Introduction",
      content:
        "By accessing or using this application, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our application.",
    },
    {
      title: "2. User Accounts",
      content:
        "When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password.",
    },
    {
      title: "3. Community Guidelines",
      content:
        "You agree to use our community features responsibly. Harassment, hate speech, spam, or any form of inappropriate content will not be tolerated and may result in account termination.",
    },
    {
      title: "4. Intellectual Property",
      content:
        "The application and its original content, features, and functionality are owned by Community App and are protected by international copyright, trademark, and other intellectual property laws.",
    },
    {
      title: "5. Termination",
      content:
        "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
    },
    {
      title: "6. Limitation of Liability",
      content:
        "In no event shall Community App, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.",
    },
    {
      title: "7. Changes to Terms",
      content:
        "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect.",
    },
    {
      title: "8. Contact Information",
      content:
        "If you have any questions about these Terms, please contact us at support@example.com.",
    },
  ];

  const lastUpdated = "December 15, 2023";
  const appVersion = "v2.1.0";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="document-text-outline"
            size={32}
            color={themeColors.primary}
          />
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Terms & Conditions
          </Text>
          <Text
            style={[styles.subheader, { color: themeColors.secondaryText }]}
          >
            Please read these carefully before using the app
          </Text>
        </View>

        {/* Meta Information */}
        <View
          style={[styles.metaContainer, { backgroundColor: themeColors.card }]}
        >
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={themeColors.secondaryText}
            />
            <Text
              style={[styles.metaText, { color: themeColors.secondaryText }]}
            >
              Last updated: {lastUpdated}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="phone-portrait-outline"
              size={16}
              color={themeColors.secondaryText}
            />
            <Text
              style={[styles.metaText, { color: themeColors.secondaryText }]}
            >
              App version: {appVersion}
            </Text>
          </View>
        </View>

        {/* Terms Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.introText, { color: themeColors.text }]}>
            Welcome to our Community App. These Terms & Conditions govern your
            use of our application and services.
          </Text>

          {termsSections.map((section, index) => (
            <View
              key={index}
              style={[styles.section, { backgroundColor: themeColors.card }]}
            >
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.sectionTitle, { color: themeColors.text }]}
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
              style={styles.linkItem}
              onPress={openPrivacyPolicy}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text style={[styles.linkText, { color: themeColors.primary }]}>
                Privacy Policy
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

            <TouchableOpacity style={styles.linkItem} onPress={openContact}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text style={[styles.linkText, { color: themeColors.primary }]}>
                Contact Support
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
            style={styles.checkboxContainer}
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
            <Text style={[styles.checkboxLabel, { color: themeColors.text }]}>
              I have read and agree to the Terms & Conditions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
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
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    flexDirection: "row",
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
    textAlign: "center",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
