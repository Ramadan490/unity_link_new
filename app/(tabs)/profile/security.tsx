import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [activityTracking, setActivityTracking] = useState(false);
  const [appLock, setAppLock] = useState(false);
  
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const themeColors = {
    background: isDark ? "#121212" : "#f9f9f9",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#333",
    secondaryText: isDark ? "#ccc" : "#666",
    border: isDark ? "#333" : "#e0e0e0",
    primary: isDark ? "#0A84FF" : "#007AFF",
    success: isDark ? "#30D158" : "#34C759",
    warning: isDark ? "#FF9F0A" : "#FF9500",
    error: isDark ? "#FF453A" : "#FF3B30",
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "You will be redirected to the password change screen.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: () => console.log("Navigate to change password") }
      ]
    );
  };

  const handleEnable2FA = () => {
    Alert.alert(
      "Enable Two-Factor Authentication",
      "This will add an extra layer of security to your account. You'll need to verify your identity using an authentication app.",
      [
        { text: "Not Now", style: "cancel" },
        { 
          text: "Enable", 
          onPress: () => {
            setTwoFA(true);
            Alert.alert("Success", "Two-factor authentication has been enabled.");
          }
        }
      ]
    );
  };

  const handleDisable2FA = () => {
    Alert.alert(
      "Disable Two-Factor Authentication",
      "Are you sure you want to disable this security feature?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Disable", 
          style: "destructive",
          onPress: () => setTwoFA(false)
        }
      ]
    );
  };

  const SecurityItem = ({ 
    icon, 
    label, 
    description, 
    value, 
    onValueChange, 
    type = "toggle",
    onPress,
    color = themeColors.primary 
  }: {
    icon: string;
    label: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: "toggle" | "button";
    onPress?: () => void;
    color?: string;
  }) => (
    <View style={[styles.item, { borderBottomColor: themeColors.border }]}>
      <View style={styles.itemContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>
          {description && (
            <Text style={[styles.description, { color: themeColors.secondaryText }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      
      {type === "toggle" ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: themeColors.border, true: color + "80" }}
          thumbColor={value ? color : isDark ? "#ccc" : "#f4f3f4"}
        />
      ) : (
        <TouchableOpacity onPress={onPress}>
          <Ionicons name="chevron-forward" size={20} color={themeColors.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top"]}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark-outline" size={32} color={themeColors.primary} />
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              Privacy & Security
            </Text>
            <Text style={[styles.subheader, { color: themeColors.secondaryText }]}>
              Manage your account security and privacy preferences
            </Text>
          </View>

          {/* Authentication Section */}
          <Text style={[styles.sectionTitle, { color: themeColors.secondaryText }]}>
            AUTHENTICATION
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="finger-print-outline"
              label="Biometric Login"
              description="Use fingerprint or face recognition to log in"
              value={biometric}
              onValueChange={setBiometric}
              color={themeColors.primary}
            />
            
            <SecurityItem
              icon="shield-checkmark-outline"
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={twoFA}
              onValueChange={twoFA ? handleDisable2FA : handleEnable2FA}
              color={twoFA ? themeColors.success : themeColors.primary}
            />
            
            <SecurityItem
              icon="lock-closed-outline"
              label="App Lock"
              description="Require PIN to open the app"
              value={appLock}
              onValueChange={setAppLock}
              color={themeColors.warning}
            />
          </View>

          {/* Privacy Section */}
          <Text style={[styles.sectionTitle, { color: themeColors.secondaryText }]}>
            PRIVACY SETTINGS
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="person-outline"
              label="Data Sharing"
              description="Allow anonymous usage data to improve the app"
              value={dataSharing}
              onValueChange={setDataSharing}
              color={themeColors.primary}
            />
            
            <SecurityItem
              icon="location-outline"
              label="Location Services"
              description="Allow access to your location for community features"
              value={locationSharing}
              onValueChange={setLocationSharing}
              color={themeColors.primary}
            />
            
            <SecurityItem
              icon="analytics-outline"
              label="Activity Tracking"
              description="Track your activity within the community"
              value={activityTracking}
              onValueChange={setActivityTracking}
              color={themeColors.primary}
            />
          </View>

          {/* Security Actions */}
          <Text style={[styles.sectionTitle, { color: themeColors.secondaryText }]}>
            SECURITY ACTIONS
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="key-outline"
              label="Change Password"
              description="Update your account password"
              type="button"
              onPress={handleChangePassword}
              color={themeColors.primary}
            />
            
            <SecurityItem
              icon="log-out-outline"
              label="Log Out All Devices"
              description="Sign out from all connected devices"
              type="button"
              onPress={() => Alert.alert("Log Out All Devices", "This will sign you out from all devices.")}
              color={themeColors.warning}
            />
            
            <SecurityItem
              icon="trash-outline"
              label="Delete Account"
              description="Permanently delete your account and data"
              type="button"
              onPress={() => Alert.alert("Delete Account", "This action cannot be undone.")}
              color={themeColors.error}
            />
          </View>

          {/* Security Status */}
          <View style={[styles.statusCard, { backgroundColor: themeColors.card }]}>
            <Ionicons name="shield-checkmark" size={24} color={themeColors.success} />
            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, { color: themeColors.text }]}>
                Security Status: {twoFA && biometric ? "Excellent" : "Good"}
              </Text>
              <Text style={[styles.statusText, { color: themeColors.secondaryText }]}>
                {twoFA && biometric 
                  ? "Your account is well protected with multiple security layers."
                  : "Consider enabling additional security features for better protection."
                }
              </Text>
            </View>
          </View>

          {/* Last Activity */}
          <View style={[styles.activityCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.activityTitle, { color: themeColors.text }]}>
              Last Activity
            </Text>
            <View style={styles.activityItem}>
              <Ionicons name="phone-portrait-outline" size={16} color={themeColors.secondaryText} />
              <Text style={[styles.activityText, { color: themeColors.secondaryText }]}>
                iPhone 13 Pro • Today at 2:30 PM
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="desktop-outline" size={16} color={themeColors.secondaryText} />
              <Text style={[styles.activityText, { color: themeColors.secondaryText }]}>
                Web Browser • Yesterday at 9:15 AM
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusContent: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activityCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    marginLeft: 8,
  },
});