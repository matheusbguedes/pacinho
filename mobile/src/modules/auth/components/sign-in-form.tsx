import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/modules/auth/context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthMode = "sign-in" | "sign-up";

type SignInFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function SignInForm({ mode, onModeChange }: SignInFormProps) {
  const { width } = useWindowDimensions();
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<"account" | "phone">("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = isSignUp ? password.length >= 6 : password.length > 0;
  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.length === 11;
  const accountReady = emailValid && passwordValid && (!isSignUp || nameValid);

  const emailError =
    emailTouched && email.trim().length > 0 && !emailValid
      ? "Confere o e-mail. Falta o @ ou o domínio."
      : undefined;
  const passwordError =
    passwordTouched && password.length > 0 && !passwordValid
      ? isSignUp
        ? "A senha precisa de 6 caracteres."
        : "Falta a senha."
      : undefined;

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

  async function handleSignUp() {
    try {
      setIsSubmitting(true);
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        phone,
      });
      router.replace(ROUTES.tabs.home);
    } catch (error) {
      Alert.alert(
        "Não foi possível criar a conta",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = isSignUp
    ? step === "phone"
      ? "Seu celular"
      : "Criar conta"
    : "Entrar";
  const subtitle = isSignUp
    ? step === "phone"
      ? "11 dígitos com DDD. Fica só na sua conta."
      : "Pra ver quem vai correr com você."
    : "Usa o e-mail da sua conta.";

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.root, { width }]}
    >
      <View style={styles.intro}>
        <ThemedText type="title" style={styles.center}>
          {title}
        </ThemedText>
        <ThemedText type="bodySmall" themeColor="textSecondary" style={styles.center}>
          {subtitle}
        </ThemedText>
      </View>

      {isSignUp && step === "phone" ? (
        <View style={styles.form}>
          <Input
            label="Celular"
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/\D/g, "").slice(0, 11))}
            placeholder="11999999999"
            keyboardType="number-pad"
            inputMode="numeric"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={11}
            autoFocus
          />
          <Button
            label={isSubmitting ? "Criando..." : "Criar conta"}
            disabled={!phoneValid || isSubmitting}
            onPress={handleSignUp}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setStep("account")}
            hitSlop={8}
            style={styles.switchHit}
          >
            <ThemedText type="bodyMedium" themeColor="textSecondary" style={styles.center}>
              Voltar
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          {isSignUp ? (
            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              autoFocus
            />
          ) : null}
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
            autoFocus={!isSignUp}
          />
          <Input
            label="Senha"
            value={password}
            error={passwordError}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            placeholder={isSignUp ? "Mínimo de 6 caracteres" : "Sua senha"}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete={isSignUp ? "new-password" : "password"}
            autoCorrect={false}
            textContentType={isSignUp ? "newPassword" : "password"}
            returnKeyType="go"
            onSubmitEditing={isSignUp ? undefined : handleSignIn}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowPassword((current) => !current)}
            hitSlop={8}
          >
            <ThemedText type="caption" themeColor="textSecondary">
              {showPassword ? "Ocultar senha" : "Mostrar senha"}
            </ThemedText>
          </Pressable>
          <Button
            label={
              isSubmitting
                ? "Entrando..."
                : isSignUp
                  ? "Continuar"
                  : "Entrar"
            }
            disabled={!accountReady || isSubmitting}
            onPress={isSignUp ? () => setStep("phone") : handleSignIn}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => onModeChange(isSignUp ? "sign-in" : "sign-up")}
            hitSlop={8}
            style={styles.switchHit}
          >
            <ThemedText type="bodyMedium" themeColor="textSecondary" style={styles.center}>
              {isSignUp ? "Já tenho conta" : "Criar conta"}
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
    gap: Spacing[6],
  },
  intro: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: Spacing[2],
  },
  center: {
    textAlign: "center",
  },
  form: {
    alignSelf: "stretch",
    gap: Spacing[4],
  },
  switchHit: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
