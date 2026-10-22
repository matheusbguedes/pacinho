import { z } from "zod";

import { genderSchema, objectiveSchema, userRoleSchema } from "./common.js";

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: userRoleSchema,
  age: z.number().nullable(),
  birth_date: z.string().nullable(),
  height_cm: z.number().nullable(),
  gender: genderSchema.nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  bio: z.string().nullable(),
  objective: objectiveSchema.nullable(),
  pace: z.string().nullable(),
  distance_km: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  profile_complete: z.boolean(),
});

export const updateProfileBodySchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(11).max(11).optional(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  height_cm: z.number().int().min(120).max(220).optional().nullable(),
  gender: genderSchema.optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  objective: objectiveSchema.optional().nullable(),
  pace: z.string().optional().nullable(),
  distance_km: z.number().positive().optional().nullable(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type UserDTO = SessionUser;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
