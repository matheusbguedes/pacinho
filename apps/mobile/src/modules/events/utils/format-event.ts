export function eventDayKey(startsAt: string) {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function buildEventDayOptions(keys: string[]) {
  const todayKey = eventDayKey(new Date().toISOString());
  const unique = [...new Set(keys)].sort();

  return unique.map((key) => {
    const date = new Date(`${key}T12:00:00-03:00`);
    const weekday = date
      .toLocaleDateString("pt-BR", {
        weekday: "short",
        timeZone: "America/Sao_Paulo",
      })
      .replace(".", "")
      .slice(0, 3);

    return {
      key,
      dayNumber: key.slice(8, 10),
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      isToday: key === todayKey,
    };
  });
}

export function formatEventDate(startsAt: string) {
  const date = new Date(startsAt);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatEventTime(startsAt: string) {
  const date = new Date(startsAt);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatEventFullDate(startsAt: string) {
  const date = new Date(startsAt);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function formatDistance(distanceKm: number | null) {
  if (!distanceKm) {
    return null;
  }

  return `${distanceKm} km`;
}

const ACCENTS = ["#CD1835", "#2D2D31", "#E86A7D", "#171719", "#A9122B"] as const;

export function accentForEvent(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index) * (index + 1)) % ACCENTS.length;
  }
  return ACCENTS[hash];
}
