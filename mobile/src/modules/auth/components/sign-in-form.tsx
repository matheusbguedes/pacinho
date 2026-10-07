import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/modules/auth/context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const { width } = useWindowDimensions();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = password.length > 0;
  const emailError =
    emailTouched && email.trim().length > 0 && !emailValid
      ? "Confere o e-mail. Falta o @ ou o domínio."
      : undefined;
  const passwordError =
    passwordTouched && !passwordValid ? "Falta a senha." : undefined;

  async function handleSignIn() {
    try {
      setIsSubmitting(true);
      await signIn(email.trim(), password);
      router.replace(ROUTES.tabs.home);
    } catch (error) {
      Alert.alert(
        "Não foi possível entrar",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { width }]}>
      <View style={styles.intro}>
        <Image
          source={require("../../../../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Pacinho"
        />
        <ThemedText type="title" style={styles.center}>
          Bem-vindo de volta
        </ThemedText>
      </View>
      <View style={styles.form}>
        <Input
          label="E-mail"
          value={email}
          error={emailError}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          inputMode="email"
          textContentType="emailAddress"
          returnKeyType="next"
          autoFocus
        />
        <Input
          label="Senha"
          value={password}
          error={passwordError}
          onChangeText={setPassword}
          onBlur={() => setPasswordTouched(true)}
          placeholder="Sua senha"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSignIn}
        />
        <Button
          label="Continuar"
          disabled={!emailValid || !passwordValid || isSubmitting}
          onPress={handleSignIn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignSelf: "stretch",
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[6],
    gap: Spacing[6],
  },
  intro: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: Spacing[3],
    marginTop: Spacing[8],
  },
  logo: {
    width: 96,
    aspectRatio: 1024 / 889,
    marginBottom: Spacing[2],
  },
  center: {
    textAlign: "center",
  },
  form: {
    alignSelf: "stretch",
    gap: Spacing[4],
  },
});
