// app/(tabs)/index.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
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

// Sudan images
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
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: AllowedRoutes;
  color: string;
  description: string;
  isTab: boolean;
};

// ✅ Centralized quick links
const quickLinks: QuickLink[] = [
  {
    title: "Announcements",
    icon: "megaphone",
    route: "/announcements",
    color: "#D21034",
    description: "Latest community news",
    isTab: true,
  },
  {
    title: "Events",
    icon: "calendar",
    route: "/events",
    color: "#007A36",
    description: "Upcoming activities",
    isTab: true,
  },
  {
    title: "Memorials",
    icon: "flower",
    route: "/memorials",
    color: "#FFD700",
    description: "Honoring our history",
    isTab: true,
  },
  {
    title: "Profile",
    icon: "person-circle",
    route: "/profile",
    color: "#6A0DAD",
    description: "Manage your info",
    isTab: true,
  },
  {
    title: "Community",
    icon: "people",
    route: "/community",
    color: "#0A84FF",
    description: "Connect with others",
    isTab: false,
  },
  {
    title: "Requests",
    icon: "document-text",
    route: "/requests",
    color: "#FF9500",
    description: "Submit or view requests",
    isTab: true,
  },
  {
    title: "Manage Users",
    icon: "people",
    route: "/manageUsers",
    color: "#FF3B30",
    description: "User management tools",
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
    <View
      style={[style, { backgroundColor: "transparent", overflow: "hidden" }]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors[0], opacity: 0.4 },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors[1],
            opacity: 0.2,
            top: "30%",
            height: "40%",
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors[2],
            opacity: 0.3,
            top: "60%",
            height: "40%",
          },
        ]}
      />
      {children}
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { theme, isDark } = useTheme();

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
      <View style={styles.header}>
        <Text style={[styles.logo, { color: theme.colors.text }]}>
          The Sudanese American Center
        </Text>
      </View>

      {/* Hero Section */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground
          source={images[index]}
          style={styles.hero}
          imageStyle={{ borderRadius: 20 }}
        >
          <GradientOverlay
            colors={["#000", "#333", "#000"]}
            style={styles.gradient}
          >
            <Text style={styles.heroTitle}>Discover Sudan</Text>
            <Text style={styles.heroSubtitle}>
              Rich Cultural Heritage & Historic Landmarks
            </Text>
          </GradientOverlay>
        </ImageBackground>
      </Animated.View>

      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Welcome to Our Community
        </Text>
        <Text
          style={[styles.sectionText, { color: theme.colors.textSecondary }]}
        >
          SAC in Arizona is a cultural, social, and charitable organization for
          the pride of the Sudanese Americans, promoting and celebrating the
          Sudanese heritage and cultural identity. We are proud to be one of the
          first such organizations in Arizona.
        </Text>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.grid}>
        {quickLinks.map((link) => (
          <Card
            key={link.title}
            title={link.title}
            icon={link.icon}
            color={link.color}
            description={link.description}
            onPress={
              () =>
                link.isTab
                  ? router.replace(link.route as TabRoutes) // ✅ tab route
                  : router.push(link.route as ExtraRoutes) // ✅ non-tab route
            }
          />
        ))}
      </View>

      {/* Featured Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Featured Content
        </Text>
        <View
          style={[styles.featuredCard, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={[styles.featuredText, { color: theme.colors.text }]}>
            Cultural Festival this weekend - Don&apos;t miss out!
          </Text>
          <TouchableOpacity>
            <Text style={styles.featuredLink}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// 🔹 Card Component
function Card({
  title,
  icon,
  color,
  description,
  onPress,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  onPress: () => void;
}) {
  const { theme, isDark } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderLeftColor: color },
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
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.cardDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { fontSize: 24, fontWeight: "800" },
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
  gradient: { flex: 1, justifyContent: "flex-end", padding: 20 },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    color: "#eee",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  sectionText: { fontSize: 15, lineHeight: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
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
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  cardDescription: { fontSize: 13, marginTop: 4 },
  featuredCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
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
  featuredText: { flex: 1, marginLeft: 12, fontSize: 14 },
  featuredLink: {
    color: "#D21034",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
});
