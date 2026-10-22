import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/modules/auth";
import { listEventsService } from "@/modules/events/services";
import { listMatchesService } from "@/modules/match/services";

type NextStep = {
  title: string;
  body: string;
  label: string;
  onPress: () => void;
};

export function useProfileScreen() {
  const { user, signOut, status } = useAuth();
  const [matchesCount, setMatchesCount] = useState<number | null>(null);
  const [eventsCount, setEventsCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadCounts() {
        try {
          const [matches, events] = await Promise.all([
            listMatchesService(),
            listEventsService(),
          ]);

          if (cancelled) {
            return;
          }

          setMatchesCount(matches.length);
          setEventsCount(events.filter((event) => event.attending).length);
        } catch {
          if (!cancelled) {
            setMatchesCount(null);
            setEventsCount(null);
          }
        }
      }

      void loadCounts();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const stats = [
    matchesCount && matchesCount > 0
      ? { label: "Matches", value: String(matchesCount) }
      : null,
    eventsCount && eventsCount > 0
      ? { label: "Eventos", value: String(eventsCount) }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  const nextStep: NextStep | null = !user?.objective
    ? {
        title: "O que você procura?",
        body: "Encontros, amizade ou treino. É isso que direciona quem você vê.",
        label: "Escolher",
        onPress: () => router.push(ROUTES.profileEdit),
      }
    : eventsCount === 0
      ? {
          title: "Confirme um evento",
          body: "A fila de gente sai da prova ou do treinão que você confirmar.",
          label: "Ver eventos",
          onPress: () => router.navigate(ROUTES.tabs.events),
        }
      : null;

  function handleEditProfile() {
    router.push(ROUTES.profileEdit);
  }

  function handleSignOut() {
    Alert.alert("Sair", "Quer sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  return {
    user,
    status,
    stats,
    nextStep,
    handleEditProfile,
    handleSignOut,
  };
}
