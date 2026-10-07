import { api } from "@/lib/api";
import type { AuthCredentials, AuthSessionResponse } from "@/modules/auth/types";

export async function signInService({ email, password }: AuthCredentials) {
  const { data } = await api.post<AuthSessionResponse>("/signin", {
    email,
    password,
  });

  return data;
}
