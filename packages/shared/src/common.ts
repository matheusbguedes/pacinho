import { z } from "zod";

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const userRoleSchema = z.enum(UserRole);
export type UserRole = z.infer<typeof userRoleSchema>;

export const Gender = {
  WOMAN: "WOMAN",
  MAN: "MAN",
  NON_BINARY: "NON_BINARY",
  OTHER: "OTHER",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;

export const genderSchema = z.enum(Gender);
export type Gender = z.infer<typeof genderSchema>;

export const Objective = {
  DATING: "DATING",
  FRIENDSHIP: "FRIENDSHIP",
  TRAINING: "TRAINING",
} as const;

export const objectiveSchema = z.enum(Objective);
export type Objective = z.infer<typeof objectiveSchema>;

export const MatchAction = {
  LIKE: "LIKE",
  PASS: "PASS",
} as const;

export const matchActionSchema = z.enum(MatchAction);
export type MatchAction = z.infer<typeof matchActionSchema>;
