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
import { Radius, Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth";
import { updateMeService } from "@/modules/profile/services";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]} />
    );
  }

  async function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      Alert.alert("Nome curto", "Usa pelo menos 2 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateMeService({
        name: trimmedName,
        phone: phone.trim() || undefined,
        city: city.trim() || null,
        region: region.trim() || null,
        pace: pace.trim() || null,
        bio: bio.trim() || null,
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

  function handleEditAvatar() {
    Alert.alert(
      "Foto em breve",
      "Por enquanto o Pacinho usa suas iniciais. Em breve você sobe uma foto.",
    );
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar foto"
                onPress={handleEditAvatar}
                style={[styles.editBadge, { backgroundColor: theme.text }]}
              >
                <Icon
                  icon={{ ios: "pencil", android: "edit" }}
                  size={Sizing.iconInline}
                  color={theme.background}
                />
              </Pressable>
            </View>

            <View style={styles.form}>
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
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
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                placeholder="11999999999"
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
                label="Pace"
                value={pace}
                onChangeText={setPace}
                placeholder="5:30"
                autoCapitalize="none"
              />
              <Input
                label="Bio"
                value={bio}
                onChangeText={setBio}
                placeholder="Como você corre, o que procura..."
                multiline
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
  editBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    gap: Spacing[4],
  },
});
