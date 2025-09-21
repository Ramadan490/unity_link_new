import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Button, Platform, View } from "react-native";

export default function TestDatePicker() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Pick a date" onPress={() => setShow(true)} />
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date(2025, 0, 1)}
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
    </View>
  );
}
