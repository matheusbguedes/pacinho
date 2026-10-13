import { BottomSheet, RNHostView } from "@expo/ui";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import { useScheme, useTheme } from "@/hooks/use-theme";
import { SignInForm, type AuthMode } from "@/modules/auth";

export default function WelcomeScreen() {
  const theme = useTheme();
  const scheme = useScheme();
  const [mode, setMode] = useState<AuthMode>("sign-up");
  const [isPresented, setIsPresented] = useState(false);

  function open(next: AuthMode) {
    setMode(next);
    setIsPresented(true);
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <View style={styles.stage}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Pacinho"
          />
          <ThemedText type="heading" style={styles.center}>
            Quem vai correr com você
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.center}>
            Provas e treinões em São Paulo. Você confirma presença e vê quem
            também vai.
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <Button label="Criar conta" onPress={() => open("sign-up")} />
          <ThemedText type="caption" themeColor="textSecondary" style={styles.center}>
            Leva um minuto. Sem cartão.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => open("sign-in")}
            hitSlop={8}
            style={styles.secondaryHit}
          >
            <ThemedText type="bodyMedium" style={styles.center}>
              Já tenho conta
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={() => setIsPresented(false)}
        snapPoints={["half", "full"]}
        showDragIndicator={false}
        contentPadding={0}
        containerColor={theme.background}
        shouldDismissOnClickOutside={false}
        shouldDismissOnBackPress
      >
        <RNHostView>
          <SignInForm key={mode} mode={mode} onModeChange={setMode} />
        </RNHostView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[8],
    gap: Spacing[3],
  },
  logo: {
    width: 120,
    aspectRatio: 1024 / 889,
    marginBottom: Spacing[3],
  },
  center: {
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    gap: Spacing[3],
  },
  secondaryHit: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
