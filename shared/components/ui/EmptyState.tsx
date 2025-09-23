// components/ui/EmptyState.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  message: string;
  icon?: React.ReactNode;
};

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: { marginBottom: 12 },
  text: { fontSize: 16, color: "#666", textAlign: "center" },
});
