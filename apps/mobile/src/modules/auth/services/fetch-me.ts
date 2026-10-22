import { api } from "@/lib/api";
import { toSessionUser } from "@/modules/auth/session-user";
import type { UserDTO } from "@/types/user";

export async function fetchMeService(timeout?: number) {
  const { data } = await api.get<UserDTO>("/users/me", {
    timeout,
  });
  return toSessionUser(data);
}
