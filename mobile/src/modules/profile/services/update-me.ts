import { api } from "@/lib/api";
import type { Objective, UserDTO } from "@/types/user";

export type UpdateMePayload = {
  name?: string;
  phone?: string;
  age?: number | null;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  objective?: Objective | null;
  pace?: string | null;
  distance_km?: number | null;
};

function omitPassword(user: UserDTO & { password?: string }): UserDTO {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function updateMeService(payload: UpdateMePayload) {
  const { data } = await api.put<UserDTO & { password?: string }>(
    "/users/me",
    payload,
  );

  return omitPassword(data);
}
