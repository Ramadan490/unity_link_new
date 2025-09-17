import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ modern SafeAreaView

// ---- Theme Colors ----
const themes = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    card: "#F8F9FA",
    border: "#E9ECEF",
  },
  dark: {
    background: "#121212",
    text: "#FFFFFF",
    card: "#1E1E1E",
    border: "#2D2D2D",
  },
};

// ---- Storage Key ----
const STORAGE_KEY = "appearanceSettings";

// ---- Font Size Options ----
const fontSizeOptions: { label: string; value: "small" | "medium" | "large" | "xlarge"; size: number }[] = [
  { label: "Small", value: "small", size: 14 },
  { label: "Medium", value: "medium", size: 16 },
  { label: "Large", value: "large", size: 18 },
  { label: "X-Large", value: "xlarge", size: 20 },
];

export default function AppearanceScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large" | "xlarge">("medium");
  const [reduceMotion, setReduceMotion] = useState(false);

  const currentTheme = isDarkMode ? themes.dark : themes.light;

  // ---- Load settings from AsyncStorage on mount ----
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setIsDarkMode(parsed.isDarkMode ?? false);
          setFontSize(parsed.fontSize ?? "medium");
          setReduceMotion(parsed.reduceMotion ?? false);
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      }
    };
    loadSettings();
  }, []);

  // ---- Save settings whenever they change ----
  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ isDarkMode, fontSize, reduceMotion })
    );
  }, [isDarkMode, fontSize, reduceMotion]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={["top", "bottom"]} // ✅ ensure notch & bottom safe areas respected
    >
      <Text style={[styles.header, { color: currentTheme.text }]}>
        Appearance Settings
      </Text>

      {/* Dark Mode Toggle */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Theme
        </Text>
        <View
          style={[
            styles.settingRow,
            { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
          ]}
        >
          <Text style={[styles.settingText, { color: currentTheme.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Font Size Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Font Size
        </Text>
        <View style={styles.fontSizeOptionsContainer}>
          {fontSizeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.fontSizeOption,
                { borderColor: currentTheme.border },
                fontSize === option.value && styles.selectedOption,
              ]}
              onPress={() => setFontSize(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: currentTheme.text },
                  fontSize === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accessibility Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Accessibility
        </Text>
        <View
          style={[
            styles.settingRow,
            { backgroundColor: currentTheme.card, borderColor: currentTheme.border },
          ]}
        >
          <Text style={[styles.settingText, { color: currentTheme.text }]}>
            Reduce Motion
          </Text>
          <Switch
            value={reduceMotion}
            onValueChange={setReduceMotion}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={reduceMotion ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Preview Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Preview
        </Text>
        <View
          style={[
            styles.settingRow,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              flexDirection: "column",
              alignItems: "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.settingText,
              {
                color: currentTheme.text,
                fontSize: fontSizeOptions.find((opt) => opt.value === fontSize)?.size,
              },
            ]}
          >
            This is how your text will look with the current settings.
          </Text>
          <Text
            style={[
              styles.settingText,
              { fontSize: 12, marginTop: 10, opacity: 0.7, color: currentTheme.text },
            ]}
          >
            Current theme: {isDarkMode ? "Dark" : "Light"} | Font size: {fontSize}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
  },
  fontSizeOption: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  fontSizeOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  optionText: {
    color: "#000",
  },
});
