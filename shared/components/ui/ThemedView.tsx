// shared/components/ui/ThemedView.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type ThemedViewProps = ViewProps & {
  type?: "default" | "card" | "primary";
  children?: React.ReactNode;
};

export default function ThemedView({
  style,
  type = "default",
  children,
  ...rest
}: ThemedViewProps) {
  const { theme } = useTheme();

  const backgroundColor =
    type === "card"
      ? theme.colors.card
      : type === "primary"
        ? theme.colors.primary
        : theme.colors.background;

  return (
    <View style={[{ backgroundColor }, styles.base, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "column",
  },
});
