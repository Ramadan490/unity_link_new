// shared/components/ui/ThemedText.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();
  const color = theme.colors.text;

  return (
    <Text
      style={[
        { color },
        type === "default" ? { fontSize: 16, lineHeight: 24 } : null,
        type === "title"
          ? { fontSize: 32, fontWeight: "bold", lineHeight: 40 }
          : null,
        type === "defaultSemiBold"
          ? { fontSize: 16, fontWeight: "600", lineHeight: 24 }
          : null,
        type === "subtitle"
          ? { fontSize: 20, fontWeight: "bold", lineHeight: 28 }
          : null,
        type === "link"
          ? { color: theme.colors.primary, fontSize: 16, lineHeight: 24 }
          : null,
        style,
      ]}
      {...rest}
    />
  );
}
