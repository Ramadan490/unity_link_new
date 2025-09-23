import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Appearance,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---- Theme Colors ----
const themes = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    card: "#F8F9FA",
    border: "#E9ECEF",
    primary: "#007AFF",
    secondary: "#6c757d",
  },
  dark: {
    background: "#121212",
    text: "#FFFFFF",
    card: "#1E1E1E",
    border: "#2D2D2D",
    primary: "#0A84FF",
    secondary: "#adb5bd",
  },
  system: {
    background: "transparent",
    text: "transparent",
    card: "transparent",
    border: "transparent",
    primary: "#007AFF",
    secondary: "#6c757d",
  },
};

// ---- Storage Key ----
const STORAGE_KEY = "appearanceSettings";

// ---- Font Size Options ----
const fontSizeOptions: {
  label: string;
  value: "small" | "medium" | "large" | "xlarge";
  size: number;
}[] = [
  { label: "Small", value: "small", size: 14 },
  { label: "Medium", value: "medium", size: 16 },
  { label: "Large", value: "large", size: 18 },
  { label: "X-Large", value: "xlarge", size: 20 },
];

// ---- Theme Options ----
const themeOptions: {
  label: string;
  value: "light" | "dark" | "system";
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { label: "Light", value: "light", icon: "sunny-outline" },
  { label: "Dark", value: "dark", icon: "moon-outline" },
  { label: "System", value: "system", icon: "phone-portrait-outline" },
];

export default function AppearanceScreen() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    "system",
  );
  const [fontSize, setFontSize] = useState<
    "small" | "medium" | "large" | "xlarge"
  >("medium");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Determine current theme based on selection
  const getCurrentTheme = () => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? themes.dark : themes.light;
    }
    return themes[themeMode];
  };

  const currentTheme = getCurrentTheme();

  // ---- Load settings from AsyncStorage on mount ----
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setThemeMode(parsed.themeMode ?? "system");
          setFontSize(parsed.fontSize ?? "medium");
          setReduceMotion(parsed.reduceMotion ?? false);
          setBoldText(parsed.boldText ?? false);
          setHighContrast(parsed.highContrast ?? false);
        }
      } catch (error) {
        console.error("Failed to load appearance settings:", error);
      }
    };
    loadSettings();
  }, []);

  // ---- Save settings whenever they change ----
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            themeMode,
            fontSize,
            reduceMotion,
            boldText,
            highContrast,
          }),
        );
      } catch (error) {
        console.error("Failed to save appearance settings:", error);
      }
    };
    saveSettings();
  }, [themeMode, fontSize, reduceMotion, boldText, highContrast]);

  // Apply theme to the entire app
  const applyTheme = () => {
    if (themeMode === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(themeMode);
    }
  };

  useEffect(() => {
    applyTheme();
  }, [themeMode]);

  const resetSettings = async () => {
    setThemeMode("system");
    setFontSize("medium");
    setReduceMotion(false);
    setBoldText(false);
    setHighContrast(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={["top", "bottom"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons
            name="color-palette-outline"
            size={32}
            color={currentTheme.primary}
          />
          <Text style={[styles.header, { color: currentTheme.text }]}>
            Appearance Settings
          </Text>
          <Text style={[styles.subheader, { color: currentTheme.secondary }]}>
            Customize how the app looks and feels
          </Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Theme
          </Text>
          <View style={styles.themeOptionsContainer}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      themeMode === option.value
                        ? currentTheme.primary
                        : currentTheme.card,
                    borderColor: currentTheme.border,
                  },
                ]}
                onPress={() => setThemeMode(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    themeMode === option.value
                      ? "#FFFFFF"
                      : currentTheme.primary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        themeMode === option.value
                          ? "#FFFFFF"
                          : currentTheme.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {themeMode === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FFFFFF"
                    style={styles.selectedIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
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
                  {
                    borderColor:
                      fontSize === option.value
                        ? currentTheme.primary
                        : currentTheme.border,
                    backgroundColor:
                      fontSize === option.value
                        ? currentTheme.primary
                        : currentTheme.card,
                  },
                ]}
                onPress={() => setFontSize(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        fontSize === option.value
                          ? "#FFFFFF"
                          : currentTheme.text,
                      fontSize: option.size,
                    },
                  ]}
                >
                  Aa
                </Text>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color:
                        fontSize === option.value
                          ? "#FFFFFF"
                          : currentTheme.text,
                    },
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
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="move-outline"
                size={22}
                color={currentTheme.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingText, { color: currentTheme.text }]}
                >
                  Reduce Motion
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: currentTheme.secondary },
                  ]}
                >
                  Limit animations and transitions
                </Text>
              </View>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{
                false: currentTheme.border,
                true: currentTheme.primary + "80",
              }}
              thumbColor={reduceMotion ? currentTheme.primary : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="text-outline"
                size={22}
                color={currentTheme.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingText, { color: currentTheme.text }]}
                >
                  Bold Text
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: currentTheme.secondary },
                  ]}
                >
                  Use heavier font weights
                </Text>
              </View>
            </View>
            <Switch
              value={boldText}
              onValueChange={setBoldText}
              trackColor={{
                false: currentTheme.border,
                true: currentTheme.primary + "80",
              }}
              thumbColor={boldText ? currentTheme.primary : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="contrast-outline"
                size={22}
                color={currentTheme.primary}
              />
              <View style={styles.settingTextContainer}>
                <Text
                  style={[styles.settingText, { color: currentTheme.text }]}
                >
                  High Contrast
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: currentTheme.secondary },
                  ]}
                >
                  Increase color contrast
                </Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{
                false: currentTheme.border,
                true: currentTheme.primary + "80",
              }}
              thumbColor={highContrast ? currentTheme.primary : "#f4f3f4"}
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
              styles.previewContainer,
              {
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.previewText,
                {
                  color: currentTheme.text,
                  fontSize: fontSizeOptions.find(
                    (opt) => opt.value === fontSize,
                  )?.size,
                  fontWeight: boldText ? "bold" : "normal",
                },
              ]}
            >
              This is how your text will look with the current settings.
            </Text>
            <View style={styles.previewMeta}>
              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: currentTheme.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.previewBadgeText,
                    { color: currentTheme.primary },
                  ]}
                >
                  {themeMode === "system"
                    ? "System"
                    : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                </Text>
              </View>
              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: currentTheme.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.previewBadgeText,
                    { color: currentTheme.primary },
                  ]}
                >
                  {fontSize}
                </Text>
              </View>
              {boldText && (
                <View
                  style={[
                    styles.previewBadge,
                    { backgroundColor: currentTheme.primary + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewBadgeText,
                      { color: currentTheme.primary },
                    ]}
                  >
                    Bold
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            },
          ]}
          onPress={resetSettings}
        >
          <Ionicons name="refresh-outline" size={20} color="#FF3B30" />
          <Text style={[styles.resetButtonText, { color: "#FF3B30" }]}>
            Reset to Default Settings
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: currentTheme.secondary }]}>
            Changes apply immediately
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  themeOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: "center",
    position: "relative",
  },
  themeOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  fontSizeOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  fontSizeOption: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  optionText: {
    fontWeight: "bold",
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  previewContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  previewText: {
    lineHeight: 24,
  },
  previewMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
  },
});
