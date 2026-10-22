import type { SessionUser } from "@pacinho/shared";

export type { SessionUser };

export function toSessionUser(user: SessionUser): SessionUser {
  return {
    ...user,
    profile_complete: user.profile_complete === true,
  };
}
