export type EventSummary = {
  id: string;
  name: string;
  starts_at: string;
  location: string;
  distance_km: number | null;
  organizer: string | null;
  ticket_url: string | null;
  created_at: string;
  attending: boolean;
  _count: {
    attendances: number;
  };
};

export type EventAttendee = {
  id: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    age: number | null;
    city: string | null;
    objective: string | null;
    pace: string | null;
  };
};

export type EventDetails = EventSummary & {
  attendances: EventAttendee[];
};

export type ListEventsParams = {
  q?: string;
  date?: string;
};
