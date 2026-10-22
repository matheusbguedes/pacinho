export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum Gender {
  WOMAN = "WOMAN",
  MAN = "MAN",
  NON_BINARY = "NON_BINARY",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum Objective {
  DATING = "DATING",
  FRIENDSHIP = "FRIENDSHIP",
  TRAINING = "TRAINING",
}

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  age: number | null;
  gender: Gender | null;
  city: string | null;
  region: string | null;
  bio: string | null;
  objective: Objective | null;
  pace: string | null;
  distance_km: number | null;
  created_at: string;
  updated_at?: string;
};
