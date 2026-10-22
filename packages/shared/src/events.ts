import { z } from "zod";

import { objectiveSchema } from "./common.js";

export const listEventsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const createEventBodySchema = z.object({
  name: z.string().min(2),
  starts_at: z.coerce.date(),
  location: z.string().min(2),
  distance_km: z.number().positive().optional().nullable(),
  organizer: z.string().optional().nullable(),
  ticket_url: z.string().url().optional().nullable(),
});

export const eventSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  starts_at: z.string(),
  location: z.string(),
  distance_km: z.number().nullable(),
  organizer: z.string().nullable(),
  ticket_url: z.string().nullable(),
  created_at: z.string(),
  attending: z.boolean(),
  _count: z.object({
    attendances: z.number(),
  }),
});

export const eventAttendeeSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    age: z.number().nullable(),
    city: z.string().nullable(),
    objective: objectiveSchema.nullable(),
    pace: z.string().nullable(),
  }),
});

export const eventDetailsSchema = eventSummarySchema.extend({
  attendances: z.array(eventAttendeeSchema),
});

export const attendanceSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  created_at: z.string(),
});

export type ListEventsParams = z.infer<typeof listEventsQuerySchema>;
export type CreateEventBody = z.infer<typeof createEventBodySchema>;
export type EventSummary = z.infer<typeof eventSummarySchema>;
export type EventAttendee = z.infer<typeof eventAttendeeSchema>;
export type EventDetails = z.infer<typeof eventDetailsSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
