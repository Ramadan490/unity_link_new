// components/domain/EventCard.tsx
import { Event } from "@/types/events"; // 👈 fixed import
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type Props = {
  event: Event;
  onRSVP?: (id: string) => void;
  onDonate?: (id: string) => void;
};

export default function EventCard({ event, onRSVP, onDonate }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>
        {event.date} • {event.location}
      </Text>
      {event.description && (
        <Text style={styles.body}>{event.description}</Text>
      )}
      {event.status && <Text style={styles.meta}>Status: {event.status}</Text>}
      {event.createdBy && (
        <Text style={styles.meta}>Created by {event.createdBy}</Text>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onRSVP && <Button title="RSVP" onPress={() => onRSVP(event.id)} />}
        {onDonate && (
          <Button title="Donate" onPress={() => onDonate(event.id)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  date: { fontSize: 14, color: "#666", marginBottom: 6 },
  body: { fontSize: 14, color: "#444", marginBottom: 6 },
  meta: { fontSize: 12, color: "#888", marginBottom: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
