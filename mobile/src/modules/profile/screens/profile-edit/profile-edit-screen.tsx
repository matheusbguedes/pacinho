import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth";
import { ObjectivePicker } from "@/modules/profile/components/objective-picker";
import { updateMeService } from "@/modules/profile/services";
import { Objective } from "@/types/user";

export function ProfileEditScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [region, setRegion] = useState(user?.region ?? "");
  const [pace, setPace] = useState(user?.pace ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [objective, setObjective] = useState<Objective | null>(
    user?.objective ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]} />
    );
  }

  async function handleSave() {
    const trimmedName = name.trim();

    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      Alert.alert("Nome curto", "Usa pelo menos 2 caracteres.");
      return;
    }

    if (trimmedPhone && trimmedPhone.length !== 11) {
      Alert.alert("Celular incompleto", "Usa 11 dígitos com DDD.");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateMeService({
        name: trimmedName,
        phone: trimmedPhone || undefined,
        city: city.trim() || null,
        region: region.trim() || null,
        pace: pace.trim() || null,
        bio: bio.trim() || null,
        objective,
      });
      await updateUser(updated);
      router.back();
    } catch (error) {
      Alert.alert(
        "Não deu pra salvar",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Spacing[6] + insets.bottom },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={() => router.back()}
              hitSlop={8}
              style={styles.backButton}
            >
              <Icon
                icon={{ ios: "chevron.left", android: "arrow_back" }}
                size={Sizing.iconLarge}
                color={theme.text}
              />
            </Pressable>

            <ThemedText type="title">Editar perfil</ThemedText>

            <View style={styles.avatarBlock}>
              <Avatar name={trimmedOr(name, user.name)} size="xl" />
            </View>

            <View style={styles.form}>
              <View style={styles.objectiveBlock}>
                <ThemedText type="bodyMedium">O que você procura</ThemedText>
                <ObjectivePicker value={objective} onChange={setObjective} />
              </View>
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
              <Input
                label="Bio"
                value={bio}
                onChangeText={setBio}
                placeholder="Como você corre, o que procura..."
                multiline
              />
              <Input
                label="Pace"
                value={pace}
                onChangeText={setPace}
                placeholder="5:30"
                autoCapitalize="none"
              />
              <Input
                label="Cidade"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                placeholder="São Paulo"
              />
              <Input
                label="Região"
                value={region}
                onChangeText={setRegion}
                autoCapitalize="words"
                placeholder="Pinheiros"
              />
              <Input
                label="E-mail"
                value={user.email}
                editable={false}
                autoCapitalize="none"
              />
              <Input
                label="Telefone"
                value={phone}
                onChangeText={(value) =>
                  setPhone(value.replace(/\D/g, "").slice(0, 11))
                }
                keyboardType="number-pad"
                inputMode="numeric"
                autoComplete="tel"
                textContentType="telephoneNumber"
                placeholder="11999999999"
                maxLength={11}
              />
            </View>

            <Button
              label={isSubmitting ? "Salvando..." : "Salvar alterações"}
              disabled={isSubmitting}
              onPress={handleSave}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function trimmedOr(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[5],
  },
  backButton: {
    width: Sizing.touchMin,
    height: Sizing.touchMin,
    marginLeft: -Spacing[2],
    alignItems: "flex-start",
    justifyContent: "center",
  },
  avatarBlock: {
    alignSelf: "center",
    marginTop: Spacing[2],
  },
  objectiveBlock: {
    gap: Spacing[2],
  },
  form: {
    gap: Spacing[4],
  },
});
