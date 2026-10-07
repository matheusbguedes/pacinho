export type UserMedia = {
  id: string;
  url: string;
  sort_order: number;
};

export type MatchPerson = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  objective: string | null;
  pace: string | null;
  distance_km: number | null;
  media: UserMedia[];
};

export type MatchActionType = "LIKE" | "PASS";

export type MatchActionResponse = {
  id: string;
  action: MatchActionType;
  is_match: boolean;
  matched_user: MatchPerson | null;
};
