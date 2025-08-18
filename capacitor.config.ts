import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.910364062f574bcaab73f4e29b43734c", 
  appName: "raithumitra",
  webDir: "dist",
  server: {
    url: "https://91036406-2f57-4bca-ab73-f4e29b43734c.lovableproject.com?forceHideBadge=true",
    cleartext: true,
    allowNavigation: ["*"],
  },
  plugins: {
    App: {
      android: {
        showSplash: true,
      },
    },
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
