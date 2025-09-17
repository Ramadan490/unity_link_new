// app/settings/index.tsx
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Link href="/settings/profile">Profile Settings →</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
