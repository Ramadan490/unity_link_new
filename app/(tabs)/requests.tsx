// app/(tabs)/requests.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Loading from '../../components/ui/Loading';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useRole } from '../../hooks/useRole';
import { deleteRequest, getRequests } from '../../services/requestService';
import { Request } from '../../types/request';

export default function RequestsScreen() {
  useAuthGuard();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, isBoardMember } = useRole();

  useEffect(() => {
    const loadRequests = async () => {
      const data = await getRequests();
      setRequests(data);
      setLoading(false);
    };
    loadRequests();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRequest(id);
          setRequests((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  if (loading) return <Loading message="Loading requests..." />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❓ Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.info}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>
              Status: {item.status} • Posted by {item.createdBy}
            </Text>

            {(isSuperAdmin || isBoardMember) && (
              <Button
                title="🗑 Delete"
                color="red"
                onPress={() => handleDelete(item.id)}
              />
            )}
          </View>
        )}
      />

      {/* FAB for Create Request (Admin/Board only) */}
      {(isSuperAdmin || isBoardMember) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => console.log('Open Create Request modal')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  info: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  desc: { fontSize: 14, color: '#555', marginBottom: 5 },
  meta: { fontSize: 12, color: '#888', marginBottom: 8 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
});
