import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.tabBar}
      tintColor={theme.primary}
      iconColor={{ default: theme.icon, selected: theme.primary }}
      indicatorColor={theme.primary}
      rippleColor={theme.primaryTint}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          sf={{ default: 'flame', selected: 'flame.fill' }}
          md="local_fire_department"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="events">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon sf="figure.run" md="directions_run" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chats">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'bubble.left.and.bubble.right',
            selected: 'bubble.left.and.bubble.right.fill',
          }}
          md="chat"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label hidden />
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
