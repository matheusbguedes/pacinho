import type { AuthSessionResponse } from "@pacinho/shared";

import { api } from "@/lib/api";
import { toSessionUser } from "@/modules/auth/session-user";

export async function signInDevService() {
  const { data } = await api.post<AuthSessionResponse>("/auth/dev");

  return {
    token: data.token,
    user: toSessionUser(data.user),
  };
}
