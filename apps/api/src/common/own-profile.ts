import { ageFromBirthDate, formatBirthDate } from "@/common/birth-date";

export const ownProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  age: true,
  birth_date: true,
  height_cm: true,
  gender: true,
  city: true,
  region: true,
  bio: true,
  objective: true,
  pace: true,
  distance_km: true,
  created_at: true,
  updated_at: true,
  _count: { select: { media: true } },
} as const;

export const PROFILE_INCOMPLETE_MESSAGE = "Complete o cadastro para continuar";

export type OwnProfileRecord = ProfileSnapshot & {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
  birth_date: Date | null;
  height_cm: number | null;
  _count: { media: number };
};

type ProfileSnapshot = {
  name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  region: string | null;
  objective: string | null;
  pace: string | null;
  distance_km: number | null;
  bio: string | null;
};

export function isProfileComplete(user: ProfileSnapshot, mediaCount: number) {
  return (
    user.name.trim().length >= 2 &&
    user.age !== null &&
    user.age >= 18 &&
    user.age <= 100 &&
    user.gender !== null &&
    hasText(user.city) &&
    hasText(user.region) &&
    user.objective !== null &&
    hasText(user.pace) &&
    user.distance_km !== null &&
    user.distance_km > 0 &&
    hasText(user.bio) &&
    user.bio !== null &&
    user.bio.length <= 500 &&
    mediaCount >= 1
  );
}

export function toOwnProfile<
  T extends ProfileSnapshot & {
    _count: { media: number };
    birth_date: Date | null;
  },
>(
  user: T,
): Omit<T, "_count" | "birth_date"> & {
  birth_date: string | null;
  profile_complete: boolean;
} {
  const { _count, birth_date: birthDate, ...profile } = user;
  const age = birthDate ? ageFromBirthDate(birthDate) : profile.age;
  return {
    ...profile,
    age,
    birth_date: birthDate ? formatBirthDate(birthDate) : null,
    profile_complete: isProfileComplete({ ...user, age }, _count.media),
  };
}

function hasText(value: string | null) {
  return value !== null && value.trim().length > 0;
}
