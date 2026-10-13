import { Objective } from "@/types/user";

const OBJECTIVE_LABEL: Record<Objective, string> = {
  [Objective.DATING]: "Encontros",
  [Objective.FRIENDSHIP]: "Amizade",
  [Objective.TRAINING]: "Treino",
};

export function formatObjective(objective: Objective | null) {
  if (!objective) {
    return null;
  }

  return OBJECTIVE_LABEL[objective];
}

export function formatJoinedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const year = date.getFullYear();
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);

  return `Desde ${capitalized} ${year}`;
}

export function formatPace(pace: string) {
  const trimmed = pace.trim();

  if (trimmed.endsWith("/km")) {
    return trimmed;
  }

  return `${trimmed}/km`;
}

export function formatLocation(city: string | null, region: string | null) {
  if (city && region) {
    return `${city}, ${region}`;
  }

  return city ?? region;
}

export function buildProfileSubtitle(input: {
  objective: Objective | null;
  pace: string | null;
  createdAt: string;
}) {
  const parts = [
    formatObjective(input.objective),
    input.pace ? formatPace(input.pace) : null,
    formatJoinedAt(input.createdAt),
  ].filter(Boolean);

  if (parts.length === 0) {
    return "Complete seu perfil pra correr com alguém em mente.";
  }

  return parts.join(" · ");
}
