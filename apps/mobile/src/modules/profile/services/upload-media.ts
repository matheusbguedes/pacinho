import type { UserMedia } from "@pacinho/shared";

import { api } from "@/lib/api";

export type UploadMediaResult = UserMedia;

type LocalPhoto = {
  uri: string;
  mimeType: string;
  fileName: string;
};

export async function uploadMyPhotoService(photo: LocalPhoto) {
  const body = new FormData();

  body.append("file", {
    uri: photo.uri,
    name: photo.fileName,
    type: photo.mimeType,
  } as unknown as Blob);

  const { data } = await api.post<UploadMediaResult>("/users/me/media", body, {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: (payload) => payload,
  });

  return data;
}
