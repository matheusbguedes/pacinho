import { create, type AxiosError, type AxiosInstance } from "axios";

import { storageAuthTokenGet } from "@/storage/storage-auth-token";

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
}) as APIInstanceProps;

api.interceptors.request.use(
  async (config) => {
    const token = await storageAuthTokenGet();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 401) {
        signOut();
      }

      return Promise.reject(
        error.response?.data?.message ?? "Ocorreu um erro",
      );
    },
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
