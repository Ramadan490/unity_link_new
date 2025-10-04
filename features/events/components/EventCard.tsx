import { Event } from "@/shared/types/events";
import { StyleSheet, Text, View } from "react-native";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>
        {new Date(event.date).toLocaleDateString()}
      </Text>

      {/* ✅ Fixed: use createdById instead of createdBy */}
      {event.createdById && (
        <Text style={styles.meta}>Created by {event.createdById}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
});
