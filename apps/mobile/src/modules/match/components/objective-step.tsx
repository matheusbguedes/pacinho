import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/modules/auth";
import { ObjectivePicker } from "@/modules/profile/components/objective-picker";
import { updateMeService } from "@/modules/profile/services";
import { Objective } from "@/types/user";

type ObjectiveStepProps = {
  hasEvent: boolean;
};

export function ObjectiveStep({ hasEvent }: ObjectiveStepProps) {
  const { updateUser } = useAuth();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!objective) {
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateMeService({ objective });
      await updateUser(updated);

      if (!hasEvent) {
        router.navigate(ROUTES.tabs.events);
      }
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
    <View style={styles.root}>
      <View style={styles.copy}>
        <ThemedText type="title">O que você procura?</ThemedText>
        <ThemedText type="bodySmall" themeColor="textSecondary">
          {hasEvent
            ? "Isso define a fila deste evento. Dá pra mudar no perfil."
            : "Depois você confirma um evento. A fila mostra quem também vai."}
        </ThemedText>
      </View>
      <ObjectivePicker value={objective} onChange={setObjective} />
      <View style={styles.footer}>
        <Button
          label={
            isSubmitting ? "Salvando..." : hasEvent ? "Ver quem vai" : "Ver eventos"
          }
          disabled={!objective || isSubmitting}
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing[5],
  },
  copy: {
    gap: Spacing[2],
  },
  footer: {
    gap: Spacing[2],
  },
});
