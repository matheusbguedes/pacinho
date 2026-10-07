import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Radius, Sizing, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { MatchPerson } from "@/modules/match/types";
import { formatObjective } from "@/modules/profile/utils/format-profile";
import { Objective } from "@/types/user";

type MatchCardProps = {
  person: MatchPerson;
  photoIndex: number;
  width: number;
  height: number;
  failedUrl?: boolean;
  onImageError?: () => void;
};

export function MatchCard({
  person,
  photoIndex,
  width,
  height,
  failedUrl = false,
  onImageError,
}: MatchCardProps) {
  const theme = useTheme();
  const photos = person.media ?? [];
  const safeIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0));
  const currentPhoto = photos[safeIndex];
  const showPhoto = Boolean(currentPhoto?.url && !failedUrl);

  const location = [person.city, person.region].filter(Boolean).join(", ");
  const objectiveLabel =
    person.objective && person.objective in Objective
      ? formatObjective(person.objective as Objective)
      : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          width,
          height,
        },
      ]}
    >
      {showPhoto && currentPhoto ? (
        <Image
          source={{ uri: currentPhoto.url }}
          style={{ width, height }}
          contentFit="cover"
          transition={120}
          cachePolicy="memory-disk"
          recyclingKey={`${person.id}-${currentPhoto.id}`}
          onError={onImageError}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width, height, backgroundColor: theme.primaryTint },
          ]}
        >
          <Avatar name={person.name} size="xl" />
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.78)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {photos.length > 0 ? (
        <View style={styles.segments} pointerEvents="none">
          {photos.map((photo, index) => (
            <View
              key={photo.id}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    index === safeIndex
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.35)",
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.info} pointerEvents="none">
        {objectiveLabel ? (
          <View style={[styles.pill, { backgroundColor: theme.primary }]}>
            <ThemedText type="caption" style={{ color: theme.onPrimary }}>
              {objectiveLabel}
            </ThemedText>
          </View>
        ) : null}

        <ThemedText type="heading" style={styles.name}>
          {person.name}
          {person.age ? (
            <ThemedText type="title" style={styles.name}>
              {" "}
              {person.age}
            </ThemedText>
          ) : null}
        </ThemedText>

        {location ? (
          <View style={styles.metaRow}>
            <Icon
              icon={{ ios: "location.fill", android: "location_on" }}
              size={Sizing.iconInline}
              color="#FFFFFF"
            />
            <ThemedText type="bodySmall" style={styles.metaText}>
              {location}
            </ThemedText>
          </View>
        ) : null}

        {person.pace ? (
          <View style={styles.metaRow}>
            <Icon
              icon={{ ios: "figure.run", android: "directions_run" }}
              size={Sizing.iconInline}
              color="#FFFFFF"
            />
            <ThemedText type="bodySmall" style={styles.metaText}>
              {person.pace}
              {person.distance_km ? ` · ${person.distance_km} km` : ""}
            </ThemedText>
          </View>
        ) : null}

        {person.bio ? (
          <ThemedText type="bodySmall" style={styles.bio} numberOfLines={2}>
            {person.bio}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "48%",
  },
  segments: {
    position: "absolute",
    top: Spacing[3],
    left: Spacing[3],
    right: Spacing[3],
    flexDirection: "row",
    gap: 4,
    zIndex: 2,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: Radius.full,
  },
  info: {
    position: "absolute",
    left: Spacing[4],
    right: Spacing[4],
    bottom: Spacing[5],
    gap: Spacing[2],
    zIndex: 2,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  name: {
    color: "#FFFFFF",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[1],
  },
  metaText: {
    color: "#FFFFFF",
    flex: 1,
  },
  bio: {
    color: "rgba(255,255,255,0.88)",
    marginTop: Spacing[1],
  },
});
