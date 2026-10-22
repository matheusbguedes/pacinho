import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon, type AppIconName } from "@/components/ui/icon";
import {
  BorderWidth,
  Radius,
  Sizing,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { UpgradeSheet } from "@/modules/account/upgrade-sheet";
import { useProfileScreen } from "@/modules/profile/screens/profile/use-profile-screen";
import { buildProfileSubtitle, formatLocation } from "@/modules/profile/utils/format-profile";

const TAB_BAR_CLEARANCE = 88;

type MenuItem = {
  key: string;
  label: string;
  icon: AppIconName;
  onPress: () => void;
  destructive?: boolean;
};

export function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const {
    user,
    status,
    stats,
    nextStep,
    handleEditProfile,
    handleSignOut,
  } = useProfileScreen();

  if (status === "loading" || !user) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]} />
    );
  }

  const menuItems: MenuItem[] = [
    {
      key: "upgrade",
      label: "Melhorar conta",
      icon: { ios: "bolt.fill", android: "bolt" },
      onPress: () => setUpgradeOpen(true),
    },
    {
      key: "edit",
      label: "Editar perfil",
      icon: { ios: "person", android: "person" },
      onPress: handleEditProfile,
    },
    {
      key: "signout",
      label: "Sair",
      icon: { ios: "rectangle.portrait.and.arrow.right", android: "logout" },
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  const subtitle = user.objective
    ? buildProfileSubtitle({
        objective: user.objective,
        pace: user.pace,
        createdAt: user.created_at,
      })
    : "Corredor no Pacinho";

  const place = formatLocation(user.city, user.region);
  const bodyLine = [
    user.age != null ? `${user.age} anos` : null,
    user.height_cm != null ? `${user.height_cm} cm` : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={styles.fill}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          ]}
        >
          <ThemedText type="title">Perfil</ThemedText>

          <View style={styles.identityRow}>
            <Avatar name={user.name} size="lg" />

            <View style={styles.identityCopy}>
              <ThemedText type="titleSmall" numberOfLines={1}>
                {user.name}
              </ThemedText>
              <ThemedText
                type="bodySmall"
                themeColor="textSecondary"
                numberOfLines={2}
              >
                {subtitle}
              </ThemedText>
              {place ? (
                <ThemedText type="caption" themeColor="textTertiary" numberOfLines={1}>
                  {place}
                </ThemedText>
              ) : null}
              {bodyLine ? (
                <ThemedText type="caption" themeColor="textTertiary" numberOfLines={1}>
                  {bodyLine}
                </ThemedText>
              ) : null}
            </View>
          </View>

          {stats.length > 0 ? (
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <ThemedText type="titleSmall">{stat.value}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {stat.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {nextStep ? (
            <View
              style={[
                styles.nextStep,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText type="titleSmall">{nextStep.title}</ThemedText>
              <ThemedText type="bodySmall" themeColor="textSecondary">
                {nextStep.body}
              </ThemedText>
              <Button label={nextStep.label} onPress={nextStep.onPress} />
            </View>
          ) : null}

          <MenuSection items={menuItems} />
        </ScrollView>
        <UpgradeSheet
          isPresented={upgradeOpen}
          onDismiss={() => setUpgradeOpen(false)}
        />
      </SafeAreaView>
    </View>
  );
}

function MenuSection({ items }: { items: MenuItem[] }) {
  return (
    <View style={styles.sectionList}>
      {items.map((item) => (
        <MenuRow key={item.key} item={item} />
      ))}
    </View>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  const theme = useTheme();
  const color = item.destructive ? theme.primary : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.menuRow,
        {
          backgroundColor: pressed ? theme.elevated : theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Icon icon={item.icon} size={Sizing.iconSmall} color={color} />
      <ThemedText type="bodyMedium" style={[styles.menuLabel, { color }]}>
        {item.label}
      </ThemedText>
      {!item.destructive ? (
        <Icon
          icon={{ ios: "chevron.right", android: "chevron_right" }}
          size={Sizing.iconSmall}
          color={theme.textTertiary}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    gap: Spacing[5],
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[4],
  },
  nextStep: {
    gap: Spacing[2],
    padding: Spacing[4],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing[2],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[1],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  sectionList: {
    gap: Spacing[2],
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    minHeight: Sizing.touchPreferred,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radius.card,
    borderWidth: BorderWidth.default,
  },
  menuLabel: {
    flex: 1,
  },
});
