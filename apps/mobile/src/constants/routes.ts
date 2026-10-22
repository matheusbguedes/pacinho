export const ROUTES = {
  welcome: "/",
  tabs: {
    home: "/(tabs)/home",
    events: "/(tabs)/events",
    chats: "/(tabs)/chats",
    profile: "/(tabs)/profile",
  },
  profileEdit: "/profile/edit",
  eventDetails: (id: string) => `/events/${id}` as const,
  eventPeople: (eventId: string, eventName: string) =>
    ({
      pathname: "/(tabs)/home",
      params: { eventId, eventName },
    }) as const,
} as const;
