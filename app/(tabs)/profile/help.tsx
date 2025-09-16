import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FAQ = {
  id: string; // Added unique identifier
  question: string;
  answer: string;
};

// Extracted to separate file for better organization
const faqs: FAQ[] = [
  {
    id: "1",
    question: "How do I update my profile?",
    answer: "Go to the Profile tab and tap on 'Edit Profile' to update your details.",
  },
  {
    id: "2",
    question: "Who can post announcements?",
    answer: "Board members and Super Admins can post announcements.",
  },
  {
    id: "3",
    question: "How do I contact support?",
    answer: "Use the 'Contact Support' button below to email our help desk.",
  },
];

// Extracted to constants file
const SUPPORT_EMAIL = "support@communityapp.com";
const SUPPORT_SUBJECT = "App Support Request";

export default function HelpScreen() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContactSupport = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn("Cannot open email client");
        // You might want to show an alert to the user here
      }
    } catch (error) {
      console.error("Error opening email client:", error);
    }
  };

  const renderFAQItem = (faq: FAQ) => {
    const isExpanded = expandedItems.has(faq.id);
    
    return (
      <View key={faq.id} style={styles.faqCard}>
        <TouchableOpacity
          onPress={() => toggleExpand(faq.id)}
          style={styles.faqHeader}
          activeOpacity={0.7}
          accessibilityLabel={faq.question}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
        >
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
            accessibilityLabel={isExpanded ? "Collapse" : "Expand"}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.subheader}>
          Find answers to common questions or contact support for assistance.
        </Text>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqsContainer}>
        {faqs.map(renderFAQItem)}
      </View>

      {/* Contact Support */}
      <TouchableOpacity 
        style={styles.supportButton} 
        onPress={handleContactSupport}
        accessibilityLabel="Contact support via email"
        accessibilityRole="button"
      >
        <Ionicons name="mail-outline" size={20} color="#fff" />
        <Text style={styles.supportButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Extracted to separate styles file for better maintainability
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    minHeight: "100%",
  },
  headerContainer: {
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2f4053",
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  faqsContainer: {
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
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
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});