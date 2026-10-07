import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Icon, type AppIconName } from "@/components/ui/icon";
import {
  BorderWidth,
  Radius,
  Sizing,
  Spacing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useProfileScreen } from "@/modules/profile/screens/profile/use-profile-screen";

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
  const {
    user,
    status,
    stats,
    handleEditAvatar,
    handleEditProfile,
    handleMyEvents,
    handleNotifications,
    handleSignOut,
  } = useProfileScreen();

  if (status === "loading" || !user) {
    return (
      <View style={[styles.fill, { backgroundColor: theme.background }]} />
    );
  }

  const generalItems: MenuItem[] = [
    {
      key: "edit",
      label: "Editar perfil",
      icon: { ios: "person", android: "person" },
      onPress: handleEditProfile,
    },
    {
      key: "events",
      label: "Meus eventos",
      icon: { ios: "mappin.and.ellipse", android: "location_on" },
      onPress: handleMyEvents,
    },
  ];

  const preferenceItems: MenuItem[] = [
    {
      key: "notifications",
      label: "Notificações",
      icon: { ios: "bell", android: "notifications" },
      onPress: handleNotifications,
    },
    {
      key: "signout",
      label: "Sair",
      icon: { ios: "rectangle.portrait.and.arrow.right", android: "logout" },
      onPress: handleSignOut,
      destructive: true,
    },
  ];

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
            <View>
              <Avatar name={user.name} size="lg" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar foto"
                onPress={handleEditAvatar}
                style={[styles.editBadge, { backgroundColor: theme.text }]}
              >
                <Icon
                  icon={{ ios: "pencil", android: "edit" }}
                  size={Sizing.iconInline}
                  color={theme.background}
                />
              </Pressable>
            </View>

            <View style={styles.identityCopy}>
              <ThemedText type="titleSmall" numberOfLines={1}>
                {user.name}
              </ThemedText>
              <ThemedText
                type="bodySmall"
                themeColor="textSecondary"
                numberOfLines={1}
              >
                {user.email}
              </ThemedText>
            </View>
          </View>

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

          <MenuSection title="Geral" items={generalItems} />
          <MenuSection title="Preferências" items={preferenceItems} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MenuSection({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <View style={styles.section}>
      <ThemedText
        type="micro"
        themeColor="textTertiary"
        style={styles.sectionLabel}
      >
        {title}
      </ThemedText>
      <View style={styles.sectionList}>
        {items.map((item) => (
          <MenuRow key={item.key} item={item} />
        ))}
      </View>
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
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
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
  section: {
    gap: Spacing[2],
  },
  sectionLabel: {
    letterSpacing: 0.4,
    paddingHorizontal: Spacing[1],
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
