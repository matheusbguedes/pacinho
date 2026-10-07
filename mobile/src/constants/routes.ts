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
} as const;
