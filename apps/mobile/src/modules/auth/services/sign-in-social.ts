import type { AuthSessionResponse, SocialSignInBody } from "@pacinho/shared";

import { api } from "@/lib/api";
import { toSessionUser } from "@/modules/auth/session-user";

export async function signInSocialService(body: SocialSignInBody) {
  const { data } = await api.post<AuthSessionResponse>("/auth/social", body);

  return {
    token: data.token,
    user: toSessionUser(data.user),
  };
}
