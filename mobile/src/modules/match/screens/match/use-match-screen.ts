import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  listPeopleService,
  sendMatchActionService,
} from "@/modules/match/services";
import type { MatchPerson } from "@/modules/match/types";

export function useMatchScreen() {
  const [people, setPeople] = useState<MatchPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [matchedUser, setMatchedUser] = useState<MatchPerson | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      try {
        const data = await listPeopleService();
        if (!cancelled) {
          setPeople(data);
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

    void loadPeople();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  async function handleSwipe(person: MatchPerson, action: "LIKE" | "PASS") {
    if (isActing) {
      return;
    }

    setPeople((current) => current.filter((item) => item.id !== person.id));

    try {
      setIsActing(true);
      const result = await sendMatchActionService({
        toId: person.id,
        action,
      });

      if (result.is_match && result.matched_user) {
        setMatchedUser(result.matched_user);
      }
    } catch (error) {
      Alert.alert(
        "Não deu pra registrar",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
      setReloadToken((current) => current + 1);
    } finally {
      setIsActing(false);
    }
  }

  function dismissMatch() {
    setMatchedUser(null);
  }

  function refresh() {
    setIsLoading(true);
    setReloadToken((current) => current + 1);
  }

  return {
    people,
    isLoading,
    isActing,
    matchedUser,
    handleSwipe,
    dismissMatch,
    refresh,
  };
}
