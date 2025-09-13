import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Memorial } from '../../types/memorial';

type Props = { item: Memorial };

function formatDate(date?: string) {
  return date ? new Date(date).toLocaleDateString() : 'Unknown date';
}

export default function MemorialCard({ item }: Props) {
  return (
    <View style={styles.card}>
      {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
      <Text style={styles.name}>{item.name}</Text>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      <Text style={styles.meta}>Added on {formatDate(item.createdAt)}</Text>
      {item.createdBy && <Text style={styles.meta}>By {item.createdBy}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 10 },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  description: { fontSize: 14, color: '#555', marginBottom: 6 },
  meta: { fontSize: 12, color: '#888' },
});
