import AsyncStorage from "@react-native-async-storage/async-storage";

import { USER_STORAGE } from "@/storage/storage-config";
import type { UserDTO } from "@/types/user";

export async function storageUserSave(user: UserDTO) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
}

export async function storageUserGet() {
  const storage = await AsyncStorage.getItem(USER_STORAGE);

  if (!storage) {
    return null;
  }

  return JSON.parse(storage) as UserDTO;
}

export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE);
}
