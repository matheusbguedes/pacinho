import { useEffect, useRef, useState, type ReactNode } from "react";

import { api } from "@/lib/api";
import {
  AuthContext,
  type AuthContextData,
} from "@/modules/auth/context/auth-context";
import {
  fetchMeService,
  signInService,
  signUpService,
} from "@/modules/auth/services";
import type { AuthStatus, SignUpPayload } from "@/modules/auth/types";
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
import type { UserDTO } from "@/types/user";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    setStatus("authenticated");
  }

  async function storageUserAndTokenSave(userData: UserDTO, token: string) {
    await Promise.all([
      storageUserSave(userData),
      storageAuthTokenSave(token),
    ]);
  }

  async function signIn(email: string, password: string) {
    const { user: userData, token } = await signInService({ email, password });
    await storageUserAndTokenSave(userData, token);
    await userAndTokenUpdate(userData, token);
  }

  async function signUp(data: SignUpPayload) {
    const { user: userData, token } = await signUpService(data);
    await storageUserAndTokenSave(userData, token);
    await userAndTokenUpdate(userData, token);
  }

  async function signOut() {
    setUser(null);
    setStatus("unauthenticated");
    await Promise.all([storageUserRemove(), storageAuthTokenRemove()]);
    delete api.defaults.headers.common.Authorization;
  }

  const signOutRef = useRef(signOut);

  useEffect(() => {
    signOutRef.current = signOut;
  });

  async function updateUser(userData: UserDTO) {
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

        if (!userLogged || !token) {
          setStatus("unauthenticated");
          return;
        }

        await userAndTokenUpdate(userLogged, token);

        try {
          const freshUser = await fetchMeService();
          await storageUserSave(freshUser);
          setUser(freshUser);
        } catch {
          // Mantém o usuário do storage se /users/me falhar offline
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
    status,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
