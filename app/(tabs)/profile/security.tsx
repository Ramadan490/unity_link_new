import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

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
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [activityTracking, setActivityTracking] = useState(false);
  const [appLock, setAppLock] = useState(false);
  const { t, i18n } = useTranslation();

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

  const isRTL = i18n.language === "ar";

  const handleChangePassword = () => {
    Alert.alert(
      t("alerts.changePasswordTitle"),
      t("alerts.changePasswordMessage"),
      [
        { text: t("alerts.cancel"), style: "cancel" },
        {
          text: t("alerts.continue"),
          onPress: () => console.log("Navigate to change password"),
        },
      ]
    );
  };

  const handleEnable2FA = () => {
    Alert.alert(t("alerts.enable2FATitle"), t("alerts.enable2FAMessage"), [
      { text: t("alerts.notNow"), style: "cancel" },
      {
        text: t("alerts.enable"),
        onPress: () => {
          setTwoFA(true);
          Alert.alert(t("alerts.success"), t("alerts.enable2FASuccess"));
        },
      },
    ]);
  };

  const handleDisable2FA = () => {
    Alert.alert(t("alerts.disable2FATitle"), t("alerts.disable2FAMessage"), [
      { text: t("alerts.cancel"), style: "cancel" },
      {
        text: t("alerts.disable"),
        style: "destructive",
        onPress: () => setTwoFA(false),
      },
    ]);
  };

  const SecurityItem = ({
    icon,
    label,
    description,
    value,
    onValueChange,
    type = "toggle",
    onPress,
    color = themeColors.primary,
    isDeleteAccount = false, // New prop to identify delete account button
  }: {
    icon: string;
    label: string;
    description?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    type?: "toggle" | "button";
    onPress?: () => void;
    color?: string;
    isDeleteAccount?: boolean; // New prop
  }) => {
    // For delete account button, always use LTR layout regardless of language
    const itemIsRTL = isDeleteAccount ? false : isRTL;

    return (
      <View style={[styles.item, { borderBottomColor: themeColors.border }]}>
        <View
          style={[
            styles.itemContent,
            itemIsRTL && { flexDirection: "row-reverse" },
          ]}
        >
          {/* Icon Container - position based on RTL/LTR */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: color + "20" },
              itemIsRTL
                ? { marginRight: 0, marginLeft: 16 }
                : { marginRight: 16 },
            ]}
          >
            <Ionicons name={icon as any} size={22} color={color} />
          </View>

          {/* Text Content */}
          <View
            style={[
              styles.textContainer,
              itemIsRTL && { alignItems: "flex-end" },
            ]}
          >
            <View style={styles.labelContainer}>
              <Text
                style={[
                  styles.label,
                  { color: themeColors.text },
                  itemIsRTL && styles.rtlText,
                ]}
              >
                {label}
              </Text>
              {type === "toggle" ? (
                <Switch
                  value={value}
                  onValueChange={onValueChange}
                  trackColor={{ false: themeColors.border, true: color + "80" }}
                  thumbColor={value ? color : isDark ? "#ccc" : "#f4f3f4"}
                  style={styles.switch}
                />
              ) : (
                <TouchableOpacity onPress={onPress} style={styles.arrowButton}>
                  <Ionicons
                    name={itemIsRTL ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color={themeColors.secondaryText}
                  />
                </TouchableOpacity>
              )}
            </View>

            {description && (
              <Text
                style={[
                  styles.description,
                  { color: themeColors.secondaryText },
                  itemIsRTL && styles.rtlText,
                ]}
              >
                {description}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={["top"]}
    >
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.headerIconContainer,
                { backgroundColor: themeColors.primary + "20" },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={36}
                color={themeColors.primary}
              />
            </View>
            <Text
              style={[
                styles.headerTitle,
                { color: themeColors.text },
                isRTL && styles.rtlText,
              ]}
            >
              {t("security.title")}
            </Text>
            <Text
              style={[
                styles.subheader,
                { color: themeColors.secondaryText },
                isRTL && styles.rtlText,
              ]}
            >
              {t("security.subtitle")}
            </Text>
          </View>

          {/* Authentication Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.secondaryText },
              isRTL && styles.rtlText,
            ]}
          >
            {t("security.authentication")}
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="finger-print-outline"
              label={t("security.biometricLogin")}
              description={t("security.biometricDescription")}
              value={biometric}
              onValueChange={setBiometric}
              color={themeColors.primary}
            />

            <SecurityItem
              icon="shield-checkmark-outline"
              label={t("security.twoFactorAuth")}
              description={t("security.twoFactorDescription")}
              value={twoFA}
              onValueChange={twoFA ? handleDisable2FA : handleEnable2FA}
              color={twoFA ? themeColors.success : themeColors.primary}
            />

            <SecurityItem
              icon="lock-closed-outline"
              label={t("security.appLock")}
              description={t("security.appLockDescription")}
              value={appLock}
              onValueChange={setAppLock}
              color={themeColors.warning}
            />
          </View>

          {/* Privacy Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.secondaryText },
              isRTL && styles.rtlText,
            ]}
          >
            {t("security.privacySettings")}
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="person-outline"
              label={t("security.dataSharing")}
              description={t("security.dataSharingDescription")}
              value={dataSharing}
              onValueChange={setDataSharing}
              color={themeColors.primary}
            />

            <SecurityItem
              icon="location-outline"
              label={t("security.locationServices")}
              description={t("security.locationDescription")}
              value={locationSharing}
              onValueChange={setLocationSharing}
              color={themeColors.primary}
            />

            <SecurityItem
              icon="analytics-outline"
              label={t("security.activityTracking")}
              description={t("security.activityDescription")}
              value={activityTracking}
              onValueChange={setActivityTracking}
              color={themeColors.primary}
            />
          </View>

          {/* Security Actions */}
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.secondaryText },
              isRTL && styles.rtlText,
            ]}
          >
            {t("security.securityActions")}
          </Text>
          <View style={[styles.card, { backgroundColor: themeColors.card }]}>
            <SecurityItem
              icon="key-outline"
              label={t("security.changePassword")}
              description={t("security.changePasswordDescription")}
              type="button"
              onPress={handleChangePassword}
              color={themeColors.primary}
            />

            <SecurityItem
              icon="log-out-outline"
              label={t("security.logoutAll")}
              description={t("security.logoutDescription")}
              type="button"
              onPress={() =>
                Alert.alert(t("alerts.logoutTitle"), t("alerts.logoutMessage"))
              }
              color={themeColors.warning}
            />

            {/* Delete Account Button - Always LTR */}
            <SecurityItem
              icon="trash-outline"
              label={t("security.deleteAccount")}
              description={t("security.deleteDescription")}
              type="button"
              onPress={() =>
                Alert.alert(
                  t("alerts.deleteAccountTitle"),
                  t("alerts.deleteAccountMessage")
                )
              }
              color={themeColors.error}
              isDeleteAccount={true} // This will force LTR layout
            />
          </View>

          {/* Security Status */}
          <View
            style={[
              styles.statusCard,
              { backgroundColor: themeColors.card },
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <View
              style={[
                styles.statusIconContainer,
                { backgroundColor: themeColors.success + "20" },
                isRTL
                  ? { marginLeft: 16, marginRight: 0 }
                  : { marginRight: 16 },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={28}
                color={themeColors.success}
              />
            </View>
            <View
              style={[
                styles.statusContent,
                isRTL && {
                  marginLeft: 0,
                  marginRight: 12,
                  alignItems: "flex-end",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusTitle,
                  { color: themeColors.text },
                  isRTL && styles.rtlText,
                ]}
              >
                {t("security.securityStatus")}:{" "}
                {twoFA && biometric
                  ? t("security.excellent")
                  : t("security.good")}
              </Text>
              <Text
                style={[
                  styles.statusText,
                  { color: themeColors.secondaryText },
                  isRTL && styles.rtlText,
                ]}
              >
                {twoFA && biometric
                  ? t("security.excellentStatus")
                  : t("security.goodStatus")}
              </Text>
            </View>
          </View>

          {/* Last Activity */}
          <View
            style={[styles.activityCard, { backgroundColor: themeColors.card }]}
          >
            <View
              style={[
                styles.activityHeader,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text
                style={[
                  styles.activityTitle,
                  { color: themeColors.text },
                  isRTL && styles.rtlText,
                ]}
              >
                {t("security.lastActivity")}
              </Text>
            </View>
            <View
              style={[
                styles.activityItem,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={themeColors.secondaryText}
              />
              <Text
                style={[
                  styles.activityText,
                  { color: themeColors.secondaryText },
                  isRTL && styles.rtlText,
                ]}
              >
                {t("security.iphoneDevice")}
              </Text>
            </View>
            <View
              style={[
                styles.activityItem,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Ionicons
                name="desktop-outline"
                size={18}
                color={themeColors.secondaryText}
              />
              <Text
                style={[
                  styles.activityText,
                  { color: themeColors.secondaryText },
                  isRTL && styles.rtlText,
                ]}
              >
                {t("security.webBrowser")}
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
    paddingHorizontal: 10,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
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
    marginBottom: 12,
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
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
  arrowButton: {
    padding: 4,
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
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
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
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingLeft: 4,
  },
  activityText: {
    fontSize: 15,
    marginLeft: 12,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
