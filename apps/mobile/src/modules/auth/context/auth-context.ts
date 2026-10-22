import { createContext } from "react";

import type { AuthProvider as SocialProvider } from "@pacinho/shared";

import type { SessionUser } from "@/modules/auth/session-user";
import type { AuthStatus } from "@/modules/auth/types";

export type AuthContextData = {
  user: SessionUser | null;
  suggestedName: string | null;
  status: AuthStatus;
  signInWithProvider: (
    provider: SocialProvider,
    identityToken: string,
    name?: string,
  ) => Promise<void>;
  signInWithDevelopment: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: SessionUser) => Promise<void>;
};

export const AuthContext = createContext<AuthContextData | null>(null);
