// components/ui/Loading.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';

type Props = {
  message?: string;
};

export default function Loading({ message = 'Loading...' }: Props) {
  const colorScheme = useColorScheme(); // light or dark
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ActivityIndicator size="large" color={isDark ? '#0A84FF' : '#007AFF'} />
      <Text style={[styles.text, { color: isDark ? '#ccc' : '#555' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { marginTop: 10, fontSize: 16 },
});
