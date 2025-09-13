import Constants from "expo-constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EnvCheck() {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;

  return (
    <View style={styles.container}>
      <Text>API URL: {apiUrl ?? "Not defined"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
