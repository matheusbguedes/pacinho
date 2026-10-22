import AsyncStorage from "@react-native-async-storage/async-storage";

import { toSessionUser, type SessionUser } from "@/modules/auth/session-user";
import { USER_STORAGE } from "@/storage/storage-config";

export async function storageUserSave(user: SessionUser) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export async function storageUserGet() {
  const storage = await AsyncStorage.getItem(USER_STORAGE);

  if (!storage) {
    return null;
  }

  return toSessionUser(JSON.parse(storage) as SessionUser);
}

export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE);
}
