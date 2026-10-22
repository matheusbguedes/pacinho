import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon, type AppIconName } from "@/components/ui/icon";
import { NativeIconButton } from "@/components/ui/native-icon-button";
import { ROUTES } from "@/constants/routes";
import {
  BorderWidth,
  Radius,
  Sizing,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  attendEventService,
  getEventService,
  unattendEventService,
} from "@/modules/events/services";
import type { EventDetails } from "@/modules/events/types";
import {
  accentForEvent,
  formatDistance,
  formatEventFullDate,
  formatEventTime,
} from "@/modules/events/utils/format-event";

export function EventDetailsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadEvent() {
      try {
        const data = await getEventService(id);
        if (!cancelled) {
          setEvent(data);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert(
            "Evento sumiu",
            typeof error === "string" ? error : "Não achamos esse evento.",
          );
          router.back();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  function openPeople() {
    if (!event) {
      return;
    }

    router.navigate(ROUTES.eventPeople(event.id, event.name));
  }

  async function handleToggleAttend() {
    if (!event) {
      return;
    }

    try {
      setIsSubmitting(true);
      if (event.attending) {
        await unattendEventService(event.id);
      } else {
        await attendEventService(event.id);
      }
      setReloadToken((current) => current + 1);
    } catch (error) {
      Alert.alert(
        "Não deu pra atualizar",
        typeof error === "string" ? error : "Tenta de novo em instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !event) {
    return (
      <View
        style={[
          styles.fill,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const accent = accentForEvent(event.id);
  const distance = formatDistance(event.distance_km);
  const previewAttendees = event.attendances.slice(0, 4);

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <View style={[styles.hero, { backgroundColor: theme.text }]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroTop}>
            <NativeIconButton
              label="Voltar"
              symbol="chevron.left"
              icon={{ ios: "chevron.left", android: "arrow_back" }}
              onPress={() => router.back()}
              color={theme.background}
            />
          </View>
          <View style={styles.heroCopy}>
            <ThemedText type="heading" style={{ color: theme.background }}>
              {event.name}
            </ThemedText>
            {event.organizer ? (
              <ThemedText
                type="bodySmall"
                style={{ color: theme.textTertiary }}
              >
                por {event.organizer}
              </ThemedText>
            ) : null}
          </View>
        </SafeAreaView>
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + Spacing[5],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <ThemedText type="titleSmall">Quem vai</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {event._count.attendances}{" "}
                {event._count.attendances === 1 ? "pessoa" : "pessoas"}
              </ThemedText>
            </View>
            {distance ? (
              <View
                style={[styles.pricePill, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="label" style={{ color: theme.onPrimary }}>
                  {distance}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {previewAttendees.length > 0 ? (
            <View style={styles.attendees}>
              {previewAttendees.map((attendance, index) => (
                <Avatar
                  key={attendance.id}
                  name={attendance.user.name}
                  size="xs"
                  style={[
                    styles.attendeeAvatar,
                    {
                      marginLeft: index === 0 ? 0 : -Spacing[2],
                      borderColor: theme.background,
                      zIndex: previewAttendees.length - index,
                    },
                  ]}
                />
              ))}
              {event._count.attendances > previewAttendees.length ? (
                <ThemedText type="caption" themeColor="textSecondary">
                  +{event._count.attendances - previewAttendees.length}
                </ThemedText>
              ) : null}
            </View>
          ) : (
            <ThemedText type="bodySmall" themeColor="textSecondary">
              Ainda ninguém marcou presença. Seja o primeiro.
            </ThemedText>
          )}

          <InfoRow
            icon={{ ios: "location.fill", android: "location_on" }}
            title={event.location}
            subtitle={event.organizer ?? "Local do encontro"}
            accent={accent}
          />
          <InfoRow
            icon={{ ios: "calendar", android: "calendar_month" }}
            title={formatEventFullDate(event.starts_at)}
            subtitle={formatEventTime(event.starts_at)}
            accent={accent}
          />

          <View style={styles.actions}>
            {event.attending ? (
              <>
                <Button label="Ver quem vai" onPress={openPeople} />
                <ThemedText type="caption" themeColor="textSecondary">
                  Você confirmou. A fila mostra só quem também vai.
                </ThemedText>
                <Button
                  label={isSubmitting ? "Atualizando..." : "Cancelar presença"}
                  variant="tertiary"
                  disabled={isSubmitting}
                  onPress={handleToggleAttend}
                />
              </>
            ) : (
              <>
                <Button
                  label={isSubmitting ? "Atualizando..." : "Eu vou"}
                  disabled={isSubmitting}
                  onPress={handleToggleAttend}
                />
                <ThemedText type="caption" themeColor="textSecondary">
                  Aí você vê quem também confirmou.
                </ThemedText>
              </>
            )}
            {event.ticket_url ? (
              <Button
                label="Abrir ingresso"
                variant="tertiary"
                onPress={() => {
                  void Linking.openURL(event.ticket_url!);
                }}
              />
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: AppIconName;
  title: string;
  subtitle: string;
  accent: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.infoRow,
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.infoIcon, { backgroundColor: accent }]}>
        <Icon icon={icon} size={Sizing.iconSmall} color={theme.onPrimary} />
      </View>
      <View style={styles.infoCopy}>
        <ThemedText type="bodyMedium" numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
  },
  heroTop: {
    paddingTop: Spacing[2],
    marginBottom: Spacing[6],
  },
  heroCopy: {
    gap: Spacing[2],
    paddingBottom: Spacing[6],
  },
  sheet: {
    flex: 1,
    marginTop: -Spacing[8],
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing[5],
  },
  sheetContent: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[4],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
  },
  titleCopy: {
    flex: 1,
    gap: 2,
  },
  pricePill: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
  },
  attendees: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  attendeeAvatar: {
    borderWidth: BorderWidth.strong,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    gap: 2,
  },
  actions: {
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
});
