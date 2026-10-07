import { BottomSheet, RNHostView } from "@expo/ui";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import { useScheme, useTheme } from "@/hooks/use-theme";
import { SignInForm } from "@/modules/auth";

export default function WelcomeScreen() {
  const theme = useTheme();
  const scheme = useScheme();
  const [isPresented, setIsPresented] = useState(false);

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
        </View>
        <View style={styles.footer}>
          <Button label="Entrar" onPress={() => setIsPresented(true)} />
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
          <SignInForm />
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
    justifyContent: "center",
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[16],
    gap: Spacing[4],
  },
  logo: {
    width: 220,
    aspectRatio: 1024 / 889,
  },
  footer: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
  },
});
