import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { listEventsService } from "@/modules/events/services";
import type { EventSummary } from "@/modules/events/types";
import { buildEventDayOptions, eventDayKey } from "@/modules/events/utils/format-event";

export function useEventsScreen() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const days = useMemo(
    () =>
      buildEventDayOptions(
        events
          .map((event) => eventDayKey(event.starts_at))
          .filter((key): key is string => key !== null),
      ),
    [events],
  );
  const activeDay = days.some((day) => day.key === selectedDay) ? selectedDay : null;
  const visibleEvents = useMemo(() => {
    if (!activeDay) {
      return events;
    }

    return events.filter((event) => eventDayKey(event.starts_at) === activeDay);
  }, [activeDay, events]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const data = await listEventsService({
          q: debouncedSearch || undefined,
        });

        if (!cancelled) {
          setEvents(data);
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
          setIsRefreshing(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, reloadToken]);

  function refresh() {
    setIsRefreshing(true);
    setReloadToken((current) => current + 1);
  }

  return {
    events: visibleEvents,
    search,
    setSearch,
    selectedDay: activeDay,
    setSelectedDay,
    days,
    isLoading,
    isRefreshing,
    refresh,
  };
}
