import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Announcement } from '../../types/announcement';
import { formatDate } from '../../utils/formatDate';

type Props = { announcement: Announcement };

export default function AnnouncementCard({ announcement }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.tabIconDefault }]}>
      <Text style={[styles.title, { color: theme.text }]}>{announcement.title}</Text>
      <Text style={{ color: theme.secondaryText }}>{announcement.body}</Text>
      <Text style={{ fontSize: 12, color: theme.icon }}>
        {formatDate(new Date().toISOString())}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
});
