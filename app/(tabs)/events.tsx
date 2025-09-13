// app/(tabs)/events.tsx
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
import EventCard from '../../components/domain/EventCard';
import Loading from '../../components/ui/Loading';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { useRole } from '../../hooks/useRole';
import { deleteEvent, getEvents } from '../../services/eventService';
import { Event } from '../../types/event';

export default function EventsScreen() {
  useAuthGuard();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, isBoardMember } = useRole();

  useEffect(() => {
    const loadEvents = async () => {
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    };
    loadEvents();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(id);
          setEvents((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const handleRSVP = (id: string) => {
    console.log(`RSVP clicked for event ${id}`);
    // later → call RSVP service
  };

  const handleDonate = (id: string) => {
    console.log(`Donate clicked for event ${id}`);
    // later → open donation flow
  };

  if (loading) return <Loading message="Loading events..." />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Events</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <EventCard
              event={item}
              onRSVP={handleRSVP}
              onDonate={handleDonate}
            />
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

      {(isSuperAdmin || isBoardMember) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => console.log('Open Create Event modal')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  row: { marginBottom: 15 },
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
