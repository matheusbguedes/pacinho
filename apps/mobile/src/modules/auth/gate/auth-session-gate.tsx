import { useRouter, useSegments } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ROUTES } from "@/constants/routes";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth/context";

type AuthSessionGateProps = {
  children: ReactNode;
};

export function AuthSessionGate({ children }: AuthSessionGateProps) {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    const firstSegment = segments[0];
    const onWelcome = !firstSegment || firstSegment === "index";
    const onProtectedRoute =
      firstSegment === "(tabs)" ||
      firstSegment === "profile" ||
      firstSegment === "events";

    if (status === "unauthenticated" && onProtectedRoute) {
      router.replace(ROUTES.welcome);
      return;
    }

    if (status === "authenticated" && onWelcome) {
      router.replace(ROUTES.tabs.home);
    }
  }, [status, segments, router]);

  return (
    <>
      {children}
      {status === "loading" ? (
        <View style={[styles.loading, { backgroundColor: theme.background }]}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
