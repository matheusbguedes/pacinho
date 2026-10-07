import { createContext } from "react";

import type { AuthStatus, SignUpPayload } from "@/modules/auth/types";
import type { UserDTO } from "@/types/user";

export type AuthContextData = {
  user: UserDTO | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: UserDTO) => Promise<void>;
};

export const AuthContext = createContext<AuthContextData | null>(null);
