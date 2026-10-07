import { api } from "@/lib/api";
import type { UserDTO } from "@/types/user";

export async function fetchMeService() {
  const { data } = await api.get<UserDTO>("/users/me");
  return data;
}
