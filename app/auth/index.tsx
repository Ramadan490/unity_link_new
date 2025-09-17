// app/auth/index.tsx
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../shared/context/AuthContext";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        await register(credential, password);
        Alert.alert("✅ Account created", "You are now logged in.");
      } else {
        await login(credential, password);
        Alert.alert("✅ Welcome back", "You are now logged in.");
      }
    } catch (error) {
      Alert.alert("❌ Authentication Failed", String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegister ? "Create Account" : "Login"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        value={credential}
        onChangeText={setCredential}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isRegister ? "Register" : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.link}>
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#007AFF", textAlign: "center", marginTop: 10 },
});
