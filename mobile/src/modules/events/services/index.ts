import { api } from "@/lib/api";
import type {
  EventDetails,
  EventSummary,
  ListEventsParams,
} from "@/modules/events/types";

export async function listEventsService(params: ListEventsParams = {}) {
  const { data } = await api.get<EventSummary[]>("/events", {
    params: {
      ...(params.q ? { q: params.q } : {}),
      ...(params.date ? { date: params.date } : {}),
    },
  });

  return data;
}

export async function getEventService(id: string) {
  const { data } = await api.get<EventDetails>(`/events/${id}`);
  return data;
}

export async function attendEventService(id: string) {
  const { data } = await api.post(`/events/${id}/attend`);
  return data;
}

export async function unattendEventService(id: string) {
  const { data } = await api.delete(`/events/${id}/attend`);
  return data;
}
