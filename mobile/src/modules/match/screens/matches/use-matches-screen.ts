import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { listMatchesService } from "@/modules/match/services";
import type { MutualMatch } from "@/modules/match/types";

export function useMatchesScreen() {
  const [matches, setMatches] = useState<MutualMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    const data = await listMatchesService();
    setMatches(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function run() {
        try {
          const data = await listMatchesService();
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
