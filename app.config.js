import "dotenv/config";

export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    orientation: "portrait",
    icon: "./assets/logos/icon.png", // ✅ moved to logos
    scheme: "unitylinknew",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/android-icon-foreground.png", // ✅ moved to icons
        backgroundImage: "./assets/icons/android-icon-background.png",
        monochromeImage: "./assets/icons/android-icon-monochrome.png",
        backgroundColor: "#E6F4FE",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/icons/favicon.png", // ✅ moved to icons
    },
    locales: {
      en: "./assets/locales/en.json", // ✅ stays
      ar: "./assets/locales/ar.json",
    },
    plugins: [
      "expo-router",
      "expo-localization",
      [
        "expo-splash-screen",
        {
          image: "./assets/splash/splash-icon.png", // ✅ moved to splash
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/splash/splash-icon.png", // 👈 optional: add splash-icon-dark.png
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
    },
  },
});
