import { Memorial } from "@/types/memorial";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  item: Memorial;
  onDateChange?: (newDate: Date) => void;
};

function formatDateTime(date?: string | Date) {
  if (!date) return "Unknown date";

  const d = date instanceof Date ? date : new Date(date);

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
    hour12: true,
  })}`;
}

export default function MemorialCard({ item, onDateChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(
    item.date ? new Date(item.date) : new Date("2025-01-01T10:00:00"),
  );

  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");

    if (selectedDate) {
      if (selectedDate.getFullYear() < 2025) {
        Alert.alert("Invalid Date", "Please select a date in 2025 or later.");
        return;
      }

      setDate(selectedDate);
      onDateChange?.(selectedDate);

      if (Platform.OS === "android") {
        Alert.alert(
          "Date Updated",
          `Scheduled for ${formatDateTime(selectedDate)}`,
        );
      }
    }
  };

  const getTimeUntilMemorial = () => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "This memorial has passed";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
    return `In ${Math.ceil(days / 30)} months`;
  };

  return (
    <View style={styles.card}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>

        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Scheduled for:</Text>
          <Text style={styles.dateText}>{formatDateTime(date)}</Text>
          <Text style={styles.timeUntil}>{getTimeUntilMemorial()}</Text>
        </View>

        {item.createdBy && (
          <Text style={styles.createdBy}>By {item.createdBy}</Text>
        )}

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.timeButtonText}>Change Date & Time</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
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
    borderRadius: 8,
    marginBottom: 12,
  },
  content: {
    // Additional content styling if needed
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  dateSection: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 13,
    color: "#4a6da7",
    fontWeight: "600",
    fontStyle: "italic",
  },
  createdBy: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4a6da7",
    alignItems: "center",
  },
  timeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
