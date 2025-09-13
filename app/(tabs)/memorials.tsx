import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MemorialCard from '../../components/domain/MemorialCard';
import MemorialForm from '../../components/domain/MemorialForm';
import Loading from '../../components/ui/Loading';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useRole } from '../../hooks/useRole';
import { addMemorial, getMemorials } from '../../services/memorialService';
import { Memorial } from '../../types/memorial';

export default function MemorialsScreen() {
  useAuthGuard();

  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, isBoardMember } = useRole();

  useEffect(() => {
    const loadMemorials = async () => {
      const data = await getMemorials();
      setMemorials(data);
      setLoading(false);
    };
    loadMemorials();
  }, []);

  const handleAdd = (memorial: Memorial) => {
    addMemorial(memorial);
    setMemorials((prev) => [memorial, ...prev]);
  };

  if (loading) return <Loading message="Loading memorials..." />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕊 Memorials</Text>

      {(isSuperAdmin || isBoardMember) && (
        <MemorialForm onSubmit={handleAdd} />
      )}

      <FlatList
        data={memorials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemorialCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
