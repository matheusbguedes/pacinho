import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/modules/auth";
import type { MatchPerson } from "@/modules/match/types";

type MatchCelebrationProps = {
  visible: boolean;
  matchedUser: MatchPerson | null;
  onContinue: () => void;
};

function PhotoBubble({
  name,
  url,
}: {
  name: string;
  url?: string;
}) {
  return (
    <View
      style={[
        styles.bubble,
        {
          borderColor: "#FFFDF8",
          backgroundColor: "#F6D9DE",
        },
      ]}
    >
      {url ? (
        <Image source={{ uri: url }} style={styles.bubbleImage} contentFit="cover" />
      ) : (
        <Avatar name={name} size="lg" />
      )}
    </View>
  );
}

export function MatchCelebration({
  visible,
  matchedUser,
  onContinue,
}: MatchCelebrationProps) {
  const { user } = useAuth();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      scale.value = 0.7;
      opacity.value = 0;
      return;
    }

    opacity.value = withTiming(1, { duration: 220 });
    scale.value = withDelay(40, withSpring(1, { damping: 12, stiffness: 160 }));
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!matchedUser || !user) {
    return null;
  }

  const mePhoto = undefined;
  const theirPhoto = matchedUser.media[0]?.url;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: "rgba(23,23,25,0.92)" }]}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <ThemedText type="display" style={styles.title}>
            É match!
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Vocês dois curtiram. Agora é só combinar a corrida.
          </ThemedText>

          <View style={styles.photos}>
            <PhotoBubble name={user.name} url={mePhoto} />
            <PhotoBubble name={matchedUser.name} url={theirPhoto} />
          </View>

          <ThemedText type="titleSmall" style={styles.names}>
            {user.name.split(" ")[0]} & {matchedUser.name.split(" ")[0]}
          </ThemedText>

          <View style={styles.actions}>
            <Button label="Continuar" onPress={onContinue} />
            <Pressable onPress={onContinue} hitSlop={8}>
              <ThemedText type="bodyMedium" style={styles.secondary}>
                Fechar
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing[6],
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: Spacing[4],
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(247,245,240,0.78)",
    textAlign: "center",
  },
  photos: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing[2],
  },
  bubble: {
    width: 112,
    height: 112,
    borderRadius: Radius.full,
    borderWidth: 4,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -Spacing[2],
  },
  bubbleImage: {
    width: "100%",
    height: "100%",
  },
  names: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: Spacing[3],
    marginTop: Spacing[4],
    alignItems: "center",
  },
  secondary: {
    color: "rgba(247,245,240,0.72)",
  },
});
