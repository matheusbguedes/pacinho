import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Radius, Spacing } from "@/constants/theme";
import { useScheme, useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth";

function failureMessage(error: unknown) {
  return typeof error === "string" ? error : "Tenta de novo em instantes.";
}

function isCanceled(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ERR_REQUEST_CANCELED"
  );
}

function appleDisplayName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
) {
  return [fullName?.givenName, fullName?.familyName].filter(Boolean).join(" ").trim();
}

export default function WelcomeScreen() {
  const theme = useTheme();
  const scheme = useScheme();
  const { width } = useWindowDimensions();
  const { signInWithProvider, signInWithDevelopment } = useAuth();
  const [appleReady, setAppleReady] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkApple() {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (!cancelled) {
          setAppleReady(available);
        }
      } catch {
        if (!cancelled) {
          setAppleReady(false);
        }
      }
    }

    void checkApple();

    return () => {
      cancelled = true;
    };
  }, []);

  async function continueWithApple() {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert("Apple", "A Apple não devolveu a identidade.");
        return;
      }

      await signInWithProvider(
        "APPLE",
        credential.identityToken,
        appleDisplayName(credential.fullName),
      );
    } catch (error) {
      if (isCanceled(error)) {
        return;
      }

      Alert.alert("Não foi possível entrar", failureMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function continueWithGoogle() {
    Alert.alert(
      "Google",
      __DEV__
        ? "A entrada com o Google fica no build de lançamento. Neste Expo Go, usa a entrada de teste."
        : "Não foi possível confirmar a identidade do Google.",
    );
  }

  async function enterDevelopment() {
    try {
      setIsSubmitting(true);
      await signInWithDevelopment();
    } catch (error) {
      Alert.alert("Não foi possível entrar", failureMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const appleWidth = width - Spacing[5] * 2;

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
          {appleReady === null ? (
            <View style={styles.appleSlot} />
          ) : appleReady ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={
                scheme === "dark"
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={Radius.button}
              style={{ width: appleWidth, height: 48 }}
              onPress={() => {
                void continueWithApple();
              }}
            />
          ) : (
            <Button
              label="Continuar com a Apple"
              disabled={isSubmitting}
              onPress={() => {
                void continueWithApple();
              }}
            />
          )}
          <Button
            label="Continuar com o Google"
            variant="secondary"
            disabled={isSubmitting}
            onPress={continueWithGoogle}
          />
          {__DEV__ ? (
            <Button
              label={isSubmitting ? "Entrando..." : "Entrar como corredor de teste"}
              variant="tertiary"
              disabled={isSubmitting}
              onPress={() => {
                void enterDevelopment();
              }}
            />
          ) : null}
        </View>
      </SafeAreaView>
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
    alignItems: "stretch",
  },
  appleSlot: {
    height: 48,
  },
});
