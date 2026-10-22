import type { UserDTO } from "@/types/user";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type AuthSessionResponse = {
  token: string;
  user: UserDTO;
};
