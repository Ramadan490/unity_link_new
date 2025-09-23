// components/ui/Button.tsx
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary";
  style?: ViewStyle; // ✅ allow style override
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.base, variant === "secondary" && styles.secondary, style]} // ✅ merge styles
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "#ccc",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
