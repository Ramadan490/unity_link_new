import { Memorial } from "@/types/memorial";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { item: Memorial };

function formatDateTime(date?: string) {
  if (!date) return "Unknown date";

  const d = new Date(date);

  // ensure date is 2025+
  if (d.getFullYear() < 2025) {
    d.setFullYear(2025);
  }

  return `${d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} at ${d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function MemorialCard({ item }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(
    item.date ? new Date(item.date) : new Date("2025-01-01T10:00:00")
  );

  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      // enforce 2025+
      if (selectedDate.getFullYear() < 2025) {
        selectedDate.setFullYear(2025);
      }
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}

      <Text style={styles.name}>{item.name}</Text>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      <Text style={styles.meta}>
        Scheduled for {formatDateTime(date.toISOString())}
      </Text>

      {item.createdBy && <Text style={styles.meta}>By {item.createdBy}</Text>}

      {/* Time picker button */}
      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.timeButtonText}>⏰ Change Date & Time</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={onChange}
          minimumDate={new Date("2025-01-01")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#222" },
  description: { fontSize: 14, color: "#555", marginBottom: 10 },
  meta: { fontSize: 12, color: "#888", marginBottom: 6 },
  timeButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#4a6da7",
    alignItems: "center",
  },
  timeButtonText: { color: "#fff", fontWeight: "600" },
});
