import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  label,
  onPress,
  variant = "primary",
}: ButtonProps) {
  const background =
    variant === "primary"
      ? "#2b6fa3"
      : variant === "danger"
        ? "#e53935"
        : "#e0e0e0";

  const textColor = variant === "secondary" ? "#000" : "#fff";

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: background }]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
});
