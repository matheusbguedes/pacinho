import { api } from "@/lib/api";
import type {
  MatchActionResponse,
  MatchActionType,
  MatchPerson,
} from "@/modules/match/types";

export async function listPeopleService(eventId?: string) {
  const { data } = await api.get<MatchPerson[]>("/matches/people", {
    params: eventId ? { event_id: eventId } : undefined,
  });

  return data;
}

export async function sendMatchActionService(input: {
  toId: string;
  action: MatchActionType;
  eventId?: string | null;
}) {
  const { data } = await api.post<MatchActionResponse>("/matches", {
    to_id: input.toId,
    action: input.action,
    event_id: input.eventId ?? null,
  });

  return data;
}
