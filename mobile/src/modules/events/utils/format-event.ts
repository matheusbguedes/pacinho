export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDayOptions(days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    const weekday = date
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "")
      .slice(0, 3);

    return {
      key: toDateKey(date),
      dayNumber: `${date.getDate()}`.padStart(2, "0"),
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      isToday: index === 0,
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
