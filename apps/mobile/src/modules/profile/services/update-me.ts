import type { UpdateProfileBody, UserDTO } from "@pacinho/shared";

import { api } from "@/lib/api";
import { toSessionUser } from "@/modules/auth/session-user";

export type UpdateMePayload = UpdateProfileBody;

function omitPassword(user: UserDTO & { password?: string }): UserDTO {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function updateMeService(payload: UpdateMePayload) {
  const { data } = await api.put<UserDTO & { password?: string }>(
    "/users/me",
    payload,
  );

  return toSessionUser(omitPassword(data));
}
