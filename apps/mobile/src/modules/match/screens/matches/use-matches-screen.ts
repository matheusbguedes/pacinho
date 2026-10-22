import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import type { Conversation } from "@pacinho/shared";

import { listConversationsService } from "@/modules/chat/services";

export function useMatchesScreen() {
  const [matches, setMatches] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    const data = await listConversationsService();
    setMatches(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function run() {
        try {
          const data = await listConversationsService();
          if (!cancelled) {
            setMatches(data);
          }
        } catch (error) {
          if (!cancelled) {
            Alert.alert(
              "Não deu pra carregar",
              typeof error === "string" ? error : "Tenta de novo em instantes.",
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      void run();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function refresh() {
    try {
      setIsRefreshing(true);
      await loadMatches();
    } catch (error) {
      Alert.alert(
        "Não deu pra carregar",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  return {
    matches,
    isLoading,
    isRefreshing,
    refresh,
  };
}
