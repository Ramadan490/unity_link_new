// components/RequestForm.tsx
import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

type Props = { onSubmit: (message: string) => void };

export default function RequestForm({ onSubmit }: Props) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message);
    setMessage('');
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Enter your request..."
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderColor: '#ccc',
  },
});
