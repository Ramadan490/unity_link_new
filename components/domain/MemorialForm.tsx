import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { Memorial } from '../../types/memorial';

type Props = {
  onSubmit: (memorial: Memorial) => void;
};

export default function MemorialForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const newMemorial: Memorial = {
      id: String(Date.now()),
      name,
      description, // ✅ use description instead of message
      createdAt: new Date().toISOString(),
      createdBy: 'currentUser',
    };
    onSubmit(newMemorial);
    setName('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Add Memorial" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
});
