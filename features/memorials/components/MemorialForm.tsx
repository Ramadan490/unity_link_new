import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";

export default function TestDatePicker() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onChange = (event: any, selectedDate?: Date) => {
    // On Android, we need to close the picker when date is selected
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (selectedDate) {
      // Ensure the selected date is 2025 or later
      if (selectedDate.getFullYear() < 2025) {
        Alert.alert("Invalid Date", "Please select a date in 2025 or later.", [
          { text: "OK" },
        ]);
        return;
      }

      setDate(selectedDate);

      // Show confirmation on Android
      if (Platform.OS === "android") {
        Alert.alert(
          "Date Selected",
          `You've chosen: ${formatDate(selectedDate)}`,
          [{ text: "OK" }],
        );
      }
    }
  };

  const showPicker = () => {
    setShow(true);
  };

  const hidePicker = () => {
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date Picker Test</Text>

      <View style={styles.dateDisplay}>
        <Text style={styles.dateLabel}>Selected Date:</Text>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Pick a Date" onPress={showPicker} color="#4a6da7" />

        {Platform.OS === "ios" && show && (
          <Button title="Cancel" onPress={hidePicker} color="#666" />
        )}
      </View>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date(2025, 0, 1)}
          maximumDate={new Date(2030, 11, 31)}
          onChange={onChange}
          accentColor="#4a6da7"
          themeVariant="light"
        />
      )}

      {/* Platform-specific info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          {Platform.OS === "ios"
            ? "iOS: Use the inline picker and tap Cancel when done"
            : "Android: Picker will close automatically after selection"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  dateDisplay: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a6da7",
  },
  buttonContainer: {
    gap: 10,
    width: "100%",
    maxWidth: 200,
  },
  info: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4a6da7",
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});
