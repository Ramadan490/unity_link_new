import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

type ThemedTextType = "body" | "label" | "title" | "subtitle" | "link"; // ✅ add link

interface Props extends TextProps {
  type?: ThemedTextType;
}

export default function ThemedText({ style, type = "body", ...props }: Props) {
  return <Text {...props} style={[styles[type], style]} />;
}

const styles = StyleSheet.create({
  body: { fontSize: 16, color: "#333" },
  label: { fontSize: 14, fontWeight: "500", color: "#666" },
  title: { fontSize: 20, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#444" },
  link: { fontSize: 16, color: "#007AFF", textDecorationLine: "underline" }, // ✅ NEW
});
