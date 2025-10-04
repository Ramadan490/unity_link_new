// app/(tabs)/index.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  I18nManager,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;


const images = [
  require("../../assets/images/sudan/sudan2.jpg"),
  require("../../assets/images/sudan/sudan3.jpg"),
  require("../../assets/images/sudan/sudan4.jpg"),
  require("../../assets/images/sudan/sudan6.jpg"),
  require("../../assets/images/sudan/sudan7.jpg"),
  require("../../assets/images/sudan/sudan8.jpg"),
];

// ✅ Define allowed routes
type TabRoutes =
  | "/announcements"
  | "/events"
  | "/memorials"
  | "/profile"
  | "/requests"
  | "/manageUsers";
type ExtraRoutes = "/community";
type AllowedRoutes = TabRoutes | ExtraRoutes;

// ✅ Quick link type
type QuickLink = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: AllowedRoutes;
  color: string;
  isTab: boolean;
};

// ✅ Quick links configuration (without translations)
const quickLinksConfig: QuickLink[] = [
  {
    id: "announcements",
    icon: "megaphone",
    route: "/announcements",
    color: "#D21034",
    isTab: true,
  },
  {
    id: "events",
    icon: "calendar",
    route: "/events",
    color: "#007A36",
    isTab: true,
  },
  {
    id: "memorials",
    icon: "flower",
    route: "/memorials",
    color: "#FFD700",
    isTab: true,
  },
  {
    id: "profile",
    icon: "person-circle",
    route: "/profile",
    color: "#6A0DAD",
    isTab: true,
  },
  {
    id: "community",
    icon: "people",
    route: "/community",
    color: "#0A84FF",
    isTab: false,
  },
  {
    id: "requests",
    icon: "document-text",
    route: "/requests",
    color: "#FF9500",
    isTab: true,
  },
  {
    id: "manageUsers",
    icon: "people",
    route: "/manageUsers",
    color: "#FF3B30",
    isTab: true,
  },
];

// Gradient overlay for hero section
const GradientOverlay = ({
  colors,
  style,
  children,
}: {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) => {
  return (
    <View style={[style, { backgroundColor: "transparent", overflow: "hidden" }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[0], opacity: 0.4 }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors[1], opacity: 0.2, top: "30%", height: "40%" },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors[2], opacity: 0.3, top: "60%", height: "40%" },
        ]}
      />
      {children}
    </View>
  );
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation(); 
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { theme, isDark } = useTheme();

  // ✅ Check if current language is RTL (Arabic)
  const isRTL = i18n.language === 'ar';
  
  // ✅ Force RTL/LTR layout based on language
  I18nManager.forceRTL(isRTL);

  // ✅ Get translation keys for each quick link
  const getQuickLinkTitle = (id: string) => {
    const titleMap: { [key: string]: string } = {
      announcements: t("announcements.title"),
      events: t("events.title"),
      memorials: t("memorials.title"),
      profile: t("tabs.profile"),
      community: t("home.quickLinks.community"),
      requests: t("requests.title"),
      manageUsers: t("tabs.manageUsers"),
    };
    return titleMap[id] || id;
  };

  const getQuickLinkDescription = (id: string) => {
    const descMap: { [key: string]: string } = {
      announcements: t("home.quickLinks.announcements"),
      events: t("home.quickLinks.events"),
      memorials: t("home.quickLinks.memorials"),
      profile: t("home.quickLinks.profile"),
      community: t("home.quickLinks.communityDesc"),
      requests: t("home.quickLinks.requests"),
      manageUsers: t("home.quickLinks.manageUsers"),
    };
    return descMap[id] || "";
  };

  // ✅ Create quick links with current translations
  const quickLinks = quickLinksConfig.map(link => ({
    ...link,
    title: getQuickLinkTitle(link.id),
    description: getQuickLinkDescription(link.id),
  }));

  // Smooth fade animation for hero image
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [index]);

  // Rotate hero image every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fadeAnim.setValue(0);
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { 
          backgroundColor: theme.colors.background, 
          paddingTop: insets.top + 10,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#aaa" : "#666"}
        />
      }
    >
      {/* Header */}
      <View style={[
        styles.header,
        isRTL && styles.headerRTL // RTL style for header
      ]}>
        <Text style={[
          styles.logo, 
          { color: theme.colors.text },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {t("home.organizationName")}
        </Text>
      </View>

      {/* Hero Section */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground
          source={images[index]}
          style={styles.hero}
          imageStyle={{ borderRadius: 20 }}
        >
          <GradientOverlay colors={["#000", "#333", "#000"]} style={styles.gradient}>
            <Text style={[
              styles.heroTitle,
              isRTL && styles.textRTL // RTL text alignment
            ]}>
              {t("home.hero.title")}
            </Text>
            <Text style={[
              styles.heroSubtitle,
              isRTL && styles.textRTL // RTL text alignment
            ]}>
              {t("home.hero.subtitle")}
            </Text>
          </GradientOverlay>
        </ImageBackground>
      </Animated.View>

      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle, 
          { color: theme.colors.text },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {t("home.welcome.title")}
        </Text>
        <Text style={[
          styles.sectionText, 
          { color: theme.colors.textSecondary },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {t("home.welcome.description")}
        </Text>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle, 
          { color: theme.colors.text },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {t("home.quickAccess.title")}
        </Text>
        <View style={[
          styles.grid,
          isRTL && styles.gridRTL // RTL grid layout
        ]}>
          {quickLinks.map((link) => (
            <Card
              key={link.id}
              title={link.title}
              icon={link.icon}
              color={link.color}
              description={link.description}
              onPress={() =>
                link.isTab
                  ? router.replace(link.route as TabRoutes)
                  : router.push(link.route as ExtraRoutes)
              }
              isRTL={isRTL}
            />
          ))}
        </View>
      </View>

      {/* Featured Section */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle, 
          { color: theme.colors.text },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {t("home.featured.title")}
        </Text>
        <View style={[
          styles.featuredCard, 
          { backgroundColor: theme.colors.card },
          isRTL && styles.featuredCardRTL // RTL layout for featured card
        ]}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={[
            styles.featuredText, 
            { color: theme.colors.text },
            isRTL && styles.textRTL // RTL text alignment
          ]}>
            {t("home.featured.content")}
          </Text>
          <TouchableOpacity>
            <Text style={[
              styles.featuredLink,
              isRTL && styles.textRTL // RTL text alignment
            ]}>
              {t("home.featured.learnMore")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// 🔹 Card Component with RTL support
function Card({
  title,
  icon,
  color,
  description,
  onPress,
  isRTL = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  onPress: () => void;
  isRTL?: boolean;
}) {
  const { theme, isDark } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.colors.card },
        isRTL ? 
          { borderRightColor: color, borderRightWidth: 4 } : // RTL: border on right
          { borderLeftColor: color, borderLeftWidth: 4 }    // LTR: border on left
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? color + "40" : color + "20" },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[
        styles.cardTitle, 
        { color: theme.colors.text },
        isRTL && styles.textRTL // RTL text alignment
      ]}>
        {title}
      </Text>
      {description && (
        <Text style={[
          styles.cardDescription, 
          { color: theme.colors.textSecondary },
          isRTL && styles.textRTL // RTL text alignment
        ]}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Styles with RTL support
const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 16, 
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerRTL: {
    flexDirection: "row-reverse", // RTL: reverse the direction
  },
  logo: { 
    fontSize: 24, 
    fontWeight: "800",
    textAlign: "left", // Default LTR
  },
  hero: {
    width: width - 32,
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
  },
  gradient: { 
    flex: 1, 
    justifyContent: "flex-end", 
    padding: 20 
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    textAlign: "left", // Default LTR
  },
  heroSubtitle: {
    color: "#eee",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "left", // Default LTR
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 12,
    textAlign: "left", // Default LTR
  },
  sectionText: { 
    fontSize: 15, 
    lineHeight: 22,
    textAlign: "left", // Default LTR
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -8,
  },
  gridRTL: {
    flexDirection: "row-reverse", // RTL: reverse the grid direction
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    marginBottom: 4,
    minHeight: 20,
    textAlign: "left", // Default LTR
  },
  cardDescription: { 
    fontSize: 13, 
    marginTop: 4,
    minHeight: 16,
    textAlign: "left", // Default LTR
  },
  featuredCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row", // LTR: left to right
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  featuredCardRTL: {
    flexDirection: "row-reverse", // RTL: right to left
  },
  featuredText: { 
    flex: 1, 
    marginLeft: 12, // LTR margin
    fontSize: 14,
    textAlign: "left", // Default LTR
  },
  featuredLink: {
    color: "#D21034",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8, // LTR margin
    textAlign: "left", // Default LTR
  },
  // RTL text alignment utility
  textRTL: {
    textAlign: "right", // RTL text alignment
  },
});