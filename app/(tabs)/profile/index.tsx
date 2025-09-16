// app/(tabs)/profile/index.tsx
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

// Make sure this is exported as default
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const handleLogout = () => {
    Alert.alert(
  'Logout',
  'Are you sure you want to logout?',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Logout',
      style: 'destructive',
      onPress: () => {
        logout();
router.replace('/(auth)/login' as Href);          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <Ionicons name="person-circle-outline" size={64} color="#666" />
        <Text style={[styles.noUserText, { color: isDark ? '#fff' : '#666' }]}>
          Please login to view your profile
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
onPress={() => router.push({ pathname: '/login' } as any)}        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <Image
          source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
          style={styles.avatar}
        />
        <Text style={[styles.userName, { color: isDark ? '#fff' : '#333' }]}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: isDark ? '#ccc' : '#666' }]}>
          {user.email}
        </Text>
        <Text style={[styles.userRole, { color: isDark ? '#007AFF' : '#007AFF' }]}>
          {user.role.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* Profile Actions */}
      <View style={[styles.actionsContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="person-outline" size={24} color="#007AFF" />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#333' }]}>
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#333' }]}>
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#333' }]}>
            Privacy & Security
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={[styles.actionText, { color: isDark ? '#fff' : '#333' }]}>
            Help & Support
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: isDark ? '#ff3b30' : '#ff3b30' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noUserText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});