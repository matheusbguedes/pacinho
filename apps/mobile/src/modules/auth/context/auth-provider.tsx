import { useEffect, useRef, useState, type ReactNode } from "react";

import type { AuthProvider as SocialProvider } from "@pacinho/shared";

import { api } from "@/lib/api";
import {
  AuthContext,
  type AuthContextData,
} from "@/modules/auth/context/auth-context";
import {
  fetchMeService,
  signInDevService,
  signInSocialService,
} from "@/modules/auth/services";
import type { SessionUser } from "@/modules/auth/session-user";
import type { AuthStatus } from "@/modules/auth/types";
import {
  storageAuthTokenGet,
  storageAuthTokenRemove,
  storageAuthTokenSave,
} from "@/storage/storage-auth-token";
import {
  storageUserGet,
  storageUserRemove,
  storageUserSave,
} from "@/storage/storage-user";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  async function userAndTokenUpdate(userData: SessionUser, token: string) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    setStatus("authenticated");
  }

  async function storageUserAndTokenSave(userData: SessionUser, token: string) {
    await Promise.all([
      storageUserSave(userData),
      storageAuthTokenSave(token),
    ]);
  }

  async function signInWithProvider(
    provider: SocialProvider,
    identityToken: string,
    name?: string,
  ) {
    const trimmedName = name?.trim() ?? "";
    const providedName = trimmedName.length >= 2 ? trimmedName : undefined;
    const { user: userData, token } = await signInSocialService({
      provider,
      identity_token: identityToken,
      ...(providedName ? { name: providedName } : {}),
    });
    setSuggestedName(providedName ?? null);
    await storageUserAndTokenSave(userData, token);
    await userAndTokenUpdate(userData, token);
  }

  async function signInWithDevelopment() {
    const { user: userData, token } = await signInDevService();
    setSuggestedName(null);
    await storageUserAndTokenSave(userData, token);
    await userAndTokenUpdate(userData, token);
  }

  async function signOut() {
    setUser(null);
    setSuggestedName(null);
    setStatus("unauthenticated");
    await Promise.all([storageUserRemove(), storageAuthTokenRemove()]);
    delete api.defaults.headers.common.Authorization;
  }

  const signOutRef = useRef(signOut);

  useEffect(() => {
    signOutRef.current = signOut;
  });

  async function updateUser(userData: SessionUser) {
    await storageUserSave(userData);
    setUser(userData);
  }

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [userLogged, token] = await Promise.all([
          storageUserGet(),
          storageAuthTokenGet(),
        ]);

        if (!token) {
          setStatus("unauthenticated");
          return;
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        try {
          const freshUser = await fetchMeService(8000);
          await storageUserSave(freshUser);
          setUser(freshUser);
          setStatus("authenticated");
        } catch (error) {
          if (error === "Não autorizado" || !userLogged) {
            setUser(null);
            setStatus("unauthenticated");
            await storageAuthTokenRemove();
            delete api.defaults.headers.common.Authorization;
            return;
          }

          setUser(userLogged);
          setStatus("authenticated");
        }
      } catch {
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    loadStorageData();
  }, []);

  useEffect(() => {
    const unsubscribe = api.registerInterceptTokenManager(() => {
      signOutRef.current();
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextData = {
    user,
    suggestedName,
    status,
    signInWithProvider,
    signInWithDevelopment,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
