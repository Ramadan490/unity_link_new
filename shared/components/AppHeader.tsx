// shared/components/AppHeader.tsx
import { ThemedText } from "@/shared/components/ui";
import { useTheme } from "@/shared/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemeToggle } from "./ThemeToggle";

interface AppHeaderProps {
  title: string;
  showThemeToggle?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showThemeToggle = true,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {showThemeToggle && <ThemeToggle />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
