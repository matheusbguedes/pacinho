import { z } from "zod";

import {
  genderSchema,
  matchActionSchema,
  objectiveSchema,
  type MatchAction,
} from "./common.js";

export const userMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  sort_order: z.number(),
});

export const matchPersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().nullable(),
  gender: genderSchema.nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  bio: z.string().nullable(),
  objective: objectiveSchema.nullable(),
  pace: z.string().nullable(),
  distance_km: z.number().nullable(),
  media: z.array(userMediaSchema),
});

export const listPeopleQuerySchema = z.object({
  event_id: z.uuid().optional(),
});

export const matchActionBodySchema = z.object({
  to_id: z.uuid(),
  action: matchActionSchema,
  event_id: z.uuid().optional().nullable(),
});

export const matchActionResponseSchema = z.object({
  id: z.string(),
  action: matchActionSchema,
  is_match: z.boolean(),
  matched_user: matchPersonSchema.nullable(),
});

export const mutualMatchSchema = z.object({
  matched_at: z.string(),
  user: matchPersonSchema,
});

export type UserMedia = z.infer<typeof userMediaSchema>;
export type MatchPerson = z.infer<typeof matchPersonSchema>;
export type MatchActionType = MatchAction;
export type ListPeopleParams = z.infer<typeof listPeopleQuerySchema>;
export type MatchActionBody = z.infer<typeof matchActionBodySchema>;
export type MatchActionResponse = z.infer<typeof matchActionResponseSchema>;
export type MutualMatch = z.infer<typeof mutualMatchSchema>;
