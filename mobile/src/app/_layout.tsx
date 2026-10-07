import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { navigationTheme } from "@/constants/theme";
import { useScheme } from "@/hooks/use-theme";
import { AuthProvider, AuthSessionGate } from "@/modules/auth";

export default function RootLayout() {
  const scheme = useScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme(scheme)}>
        <AuthProvider>
          <AuthSessionGate>
            <StatusBar style={scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="index" />
              <Stack.Screen
                name="profile/edit"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="events/[id]"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </AuthSessionGate>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
