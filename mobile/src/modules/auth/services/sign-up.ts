import { api } from "@/lib/api";
import type { AuthSessionResponse, SignUpPayload } from "@/modules/auth/types";

export async function signUpService(payload: SignUpPayload) {
  const { data } = await api.post<AuthSessionResponse>("/signup", payload);
  return data;
}
