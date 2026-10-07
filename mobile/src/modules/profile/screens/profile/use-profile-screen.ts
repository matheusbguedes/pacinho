import { router } from "expo-router";
import { Alert } from "react-native";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/modules/auth";

export function useProfileScreen() {
  const { user, signOut, status } = useAuth();

  const stats = [
    { label: "Matches", value: "0" },
    { label: "Eventos", value: "0" },
    { label: "Chats", value: "0" },
  ];

  function handleEditAvatar() {
    Alert.alert(
      "Foto em breve",
      "Por enquanto o Pacinho usa suas iniciais. Em breve você sobe uma foto.",
    );
  }

  function handleEditProfile() {
    router.push(ROUTES.profileEdit);
  }

  function handleMyEvents() {
    Alert.alert("Em breve", "Seus eventos vão aparecer aqui.");
  }

  function handleNotifications() {
    Alert.alert("Em breve", "Notificações em construção.");
  }

  function handleSignOut() {
    Alert.alert("Sair", "Quer sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  return {
    user,
    status,
    stats,
    handleEditAvatar,
    handleEditProfile,
    handleMyEvents,
    handleNotifications,
    handleSignOut,
  };
}
