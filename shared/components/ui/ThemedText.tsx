import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

type ThemedTextProps = TextProps & {
  type?: "title" | "subtitle" | "body" | "label";
};

export default function ThemedText({ type = "body", style, ...props }: ThemedTextProps) {
  return <Text style={[styles[type], style]} {...props} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 18, fontWeight: "500", color: "#666" },
  body: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#999" },
});
