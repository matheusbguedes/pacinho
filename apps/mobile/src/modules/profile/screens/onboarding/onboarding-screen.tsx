import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { BorderWidth, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/modules/auth";
import { fetchMeService } from "@/modules/auth/services";
import { GenderPicker } from "@/modules/profile/components/gender-picker";
import { ObjectivePicker } from "@/modules/profile/components/objective-picker";
import { updateMeService, uploadMyPhotoService } from "@/modules/profile/services";
import { Gender, Objective } from "@/types/user";
import {
  birthDateError,
  birthDateToIso,
  formatBirthDateInput,
  maskBirthDate,
  parseHeightCm,
} from "@/modules/profile/utils/birth-date";

type LocalPhoto = {
  uri: string;
  mimeType: string;
  fileName: string;
};

function failureMessage(error: unknown, fallback: string) {
  return typeof error === "string" ? error : fallback;
}

export function OnboardingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, suggestedName, updateUser, signOut } = useAuth();

  const initialName =
    user && user.name.trim().length >= 2 ? user.name : (suggestedName ?? "");

  const [name, setName] = useState(initialName);
  const [birthDate, setBirthDate] = useState(formatBirthDateInput(user?.birth_date));
  const [height, setHeight] = useState(
    user?.height_cm ? String(user.height_cm) : "",
  );
  const [gender, setGender] = useState<Gender | null>(user?.gender ?? null);
  const [city, setCity] = useState(user?.city ?? "");
  const [region, setRegion] = useState(user?.region ?? "");
  const [objective, setObjective] = useState<Objective | null>(user?.objective ?? null);
  const [pace, setPace] = useState(user?.pace ?? "");
  const [distance, setDistance] = useState(
    user?.distance_km ? String(user.distance_km) : "",
  );
  const [bio, setBio] = useState(user?.bio ?? "");
  const [photo, setPhoto] = useState<LocalPhoto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Foto",
        "O Pacinho precisa de uma foto da biblioteca para o card.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset) {
      return;
    }

    setPhoto({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? "photo.jpg",
    });
  }

  function invalidMessage() {
    const trimmedName = name.trim();
    const distanceNumber = Number(distance.replace(",", "."));
    const trimmedBio = bio.trim();
    const birthProblem = birthDateError(birthDate);
    const heightCm = parseHeightCm(height);

    if (!photo) {
      return "Escolhe uma foto pro card.";
    }

    if (trimmedName.length < 2) {
      return "O nome precisa de pelo menos 2 caracteres.";
    }

    if (birthProblem) {
      return birthProblem;
    }

    if (heightCm === "invalid") {
      return "A altura fica entre 120 e 220 cm.";
    }

    if (!gender) {
      return "Escolhe como você aparece no card.";
    }

    if (!city.trim() || !region.trim()) {
      return "Cidade e região entram no card.";
    }

    if (!objective) {
      return "Escolhe o que você busca.";
    }

    if (!pace.trim()) {
      return "Conta o seu ritmo, por exemplo 5:30.";
    }

    if (!(distanceNumber > 0)) {
      return "A distância precisa ser maior que zero.";
    }

    if (trimmedBio.length === 0 || trimmedBio.length > 500) {
      return "A bio fica entre 1 e 500 caracteres.";
    }

    return null;
  }

  async function handleSubmit() {
    const problem = invalidMessage();

    if (problem || !photo || !gender || !objective) {
      Alert.alert("Cadastro", problem ?? "Falta algum dado do card.");
      return;
    }

    try {
      setIsSubmitting(true);
      const isoBirthDate = birthDateToIso(birthDate);
      const heightCm = parseHeightCm(height);
      const updated = await updateMeService({
        name: name.trim(),
        ...(typeof isoBirthDate === "string" ? { birth_date: isoBirthDate } : {}),
        ...(typeof heightCm === "number" ? { height_cm: heightCm } : {}),
        gender,
        city: city.trim(),
        region: region.trim(),
        objective,
        pace: pace.trim(),
        distance_km: Number(distance.replace(",", ".")),
        bio: bio.trim(),
      });
      await updateUser(updated);
      await uploadMyPhotoService(photo);
      const fresh = await fetchMeService();
      await updateUser(fresh);

      if (fresh.profile_complete) {
        router.replace(ROUTES.tabs.home);
      } else {
        Alert.alert("Cadastro", "Ainda falta algum dado do card.");
      }
    } catch (error) {
      Alert.alert(
        "Não deu pra salvar",
        failureMessage(error, "Tenta de novo em instantes."),
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Spacing[8] + insets.bottom },
            ]}
          >
            <View style={styles.intro}>
              <ThemedText type="heading">Seu card</ThemedText>
              <ThemedText type="body" themeColor="textSecondary">
                Isso é o que a outra pessoa vê antes de curtir ou passar.
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escolher foto"
              onPress={pickPhoto}
              style={[
                styles.photo,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photoImage}
                  contentFit="cover"
                />
              ) : (
                <ThemedText type="bodyMedium">Escolher foto</ThemedText>
              )}
            </Pressable>

            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <Input
              label="Nascimento"
              value={birthDate}
              onChangeText={(value) => setBirthDate(maskBirthDate(value))}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="22/10/1997"
              maxLength={10}
            />
            <ThemedText type="caption" themeColor="textSecondary">
              Opcional. O card mostra a idade, calculada em São Paulo.
            </ThemedText>
            <Input
              label="Altura (cm)"
              value={height}
              onChangeText={(value) => setHeight(value.replace(/\D/g, "").slice(0, 3))}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="175"
              maxLength={3}
            />
            <ThemedText type="caption" themeColor="textSecondary">
              Opcional. Não aparece no card.
            </ThemedText>

            <View style={styles.group}>
              <ThemedText type="label">Gênero</ThemedText>
              <GenderPicker value={gender} onChange={setGender} />
            </View>

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

            <View style={styles.group}>
              <ThemedText type="label">O que você busca</ThemedText>
              <ObjectivePicker value={objective} onChange={setObjective} />
            </View>

            <Input
              label="Ritmo"
              value={pace}
              onChangeText={setPace}
              autoCapitalize="none"
              placeholder="5:30"
            />
            <Input
              label="Distância (km)"
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              inputMode="decimal"
              placeholder="10"
            />
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
              placeholder="Como é correr com você."
            />
            <ThemedText type="caption" themeColor="textSecondary">
              {bio.trim().length}/500
            </ThemedText>

            <Button
              label={isSubmitting ? "Salvando..." : "Entrar na Gente"}
              disabled={isSubmitting}
              onPress={handleSubmit}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void signOut();
              }}
              hitSlop={8}
              style={styles.signOut}
            >
              <ThemedText type="bodyMedium" themeColor="textSecondary">
                Sair
              </ThemedText>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  intro: {
    gap: Spacing[2],
  },
  photo: {
    height: 220,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.strong,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  group: {
    gap: Spacing[2],
  },
  signOut: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
