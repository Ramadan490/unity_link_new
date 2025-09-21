// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ✅ Updated plugin name for Reanimated v3+
      "react-native-worklets/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/config": "./shared/config",
            "@/services": "./features/users/services",
            "@/utils": "./shared/utils",
            "@/components": "./shared/components",
            "@/context": "./shared/context",
            "@/hooks": "./shared/hooks",
            "@/types": "./shared/types",
            "@/constants": "./shared/constants",
            "@": "./",
          },
        },
      ],
    ],
  };
};
