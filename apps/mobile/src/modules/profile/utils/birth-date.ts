const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function maskBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter((part) => part.length > 0).join("/");
}

export function formatBirthDateInput(iso: string | null | undefined) {
  if (!iso) {
    return "";
  }

  const match = ISO_DATE.exec(iso);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function birthDateToIso(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const match = DISPLAY_DATE.exec(trimmed);

  if (!match) {
    return "invalid" as const;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!exists) {
    return "invalid" as const;
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function ageInSaoPaulo(isoDate: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const [birthYear, birthMonth, birthDay] = isoDate.split("-").map(Number);
  let age = year - birthYear;

  if (month < birthMonth || (month === birthMonth && day < birthDay)) {
    age -= 1;
  }

  return age;
}

export function birthDateError(value: string) {
  const iso = birthDateToIso(value);

  if (iso === null) {
    return null;
  }

  if (iso === "invalid") {
    return "Data de nascimento inválida";
  }

  const age = ageInSaoPaulo(iso);

  if (age < 18 || age > 100) {
    return "A idade precisa estar entre 18 e 100";
  }

  return null;
}

export function parseHeightCm(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    return "invalid" as const;
  }

  const height = Number(trimmed);

  if (height < 120 || height > 220) {
    return "invalid" as const;
  }

  return height;
}
