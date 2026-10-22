import { z } from "zod";

import { sessionUserSchema } from "./profile.js";

export const authProviderSchema = z.enum(["APPLE", "GOOGLE"]);

export const socialSignInBodySchema = z.object({
  provider: authProviderSchema,
  identity_token: z.string().min(1),
  name: z.string().min(2).optional(),
});

export const authSessionSchema = z.object({
  token: z.string(),
  user: sessionUserSchema,
});

export type AuthProvider = z.infer<typeof authProviderSchema>;
export type SocialSignInBody = z.infer<typeof socialSignInBodySchema>;
export type AuthSessionResponse = z.infer<typeof authSessionSchema>;
