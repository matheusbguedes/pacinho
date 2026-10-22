import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Palette, Radius, Sizing, Spacing } from "@/constants/theme";
import {
  ACCOUNT_PLANS,
  FOUNDER_PLAN,
  FREE_ACCOUNT,
  PAID_ACCOUNT,
  type PlanId,
} from "@/modules/account/plans";

type UpgradeSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
};

export function UpgradeSheet({ isPresented, onDismiss }: UpgradeSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [selected, setSelected] = useState<PlanId>("semester");
  const plans = [...ACCOUNT_PLANS, FOUNDER_PLAN];
  const chosen = plans.find((plan) => plan.id === selected) ?? ACCOUNT_PLANS[2];

  function continueWithPlan() {
    Alert.alert(
      chosen.name,
      "A cobrança ainda não abre. Os preços e o que entra em cada plano já estão aqui.",
    );
  }

  return (
    <Modal
      visible={isPresented}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={onDismiss}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />
        <View style={[styles.sheet, { maxHeight: height * 0.92 }]}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing[6] }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={[Palette.primary, Palette.ink]}
              style={styles.hero}
            >
              <View style={styles.grabber} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={onDismiss}
                hitSlop={8}
                style={styles.close}
              >
                <Icon
                  icon={{ ios: "xmark", android: "close" }}
                  size={Sizing.iconStandard}
                  color={Palette.textOnDark}
                />
              </Pressable>
              <ThemedText type="heading" style={styles.heroTitle}>
                Melhorar a conta
              </ThemedText>
              <ThemedText type="body" style={styles.heroBody}>
                O app continua de graça. O pago é destaque e conveniência.
              </ThemedText>
            </LinearGradient>

            <View style={styles.body}>
              <View style={styles.plans}>
                {plans.map((plan) => {
                  const active = plan.id === selected;

                  return (
                    <Pressable
                      key={plan.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSelected(plan.id)}
                      style={[
                        styles.plan,
                        {
                          borderColor: active ? Palette.primary : Palette.darkBorder,
                          backgroundColor: active ? Palette.carbon : Palette.ink,
                        },
                      ]}
                    >
                      <View style={styles.planTop}>
                        <ThemedText type="label" style={styles.onDark}>
                          {plan.name}
                        </ThemedText>
                        {plan.featured ? (
                          <ThemedText type="caption" style={styles.featured}>
                            Destaque
                          </ThemedText>
                        ) : null}
                      </View>
                      <ThemedText type="titleSmall" style={styles.onDark}>
                        {plan.price}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.muted}>
                        {plan.period}
                      </ThemedText>
                      <ThemedText type="bodySmall" style={styles.muted}>
                        {plan.detail}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <FeatureList title="Grátis" items={FREE_ACCOUNT} />
              <FeatureList title="No plano" items={PAID_ACCOUNT} />

              <Button label={`Seguir com ${chosen.name}`} onPress={continueWithPlan} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.features}>
      <ThemedText type="titleSmall" style={styles.onDark}>
        {title}
      </ThemedText>
      {items.map((item) => (
        <ThemedText key={item} type="bodySmall" style={styles.muted}>
          {item}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    backgroundColor: Palette.ink,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    overflow: "hidden",
  },
  hero: {
    minHeight: 180,
    justifyContent: "flex-end",
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[5],
    gap: Spacing[2],
  },
  grabber: {
    position: "absolute",
    top: Spacing[2],
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255, 253, 248, 0.45)",
  },
  close: {
    position: "absolute",
    top: Spacing[3],
    right: Spacing[4],
    width: Sizing.touchMin,
    height: Sizing.touchMin,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: Palette.textOnDark,
  },
  heroBody: {
    color: Palette.textOnDark,
  },
  body: {
    paddingHorizontal: Spacing[5],
    gap: Spacing[5],
  },
  plans: {
    gap: Spacing[3],
  },
  plan: {
    gap: Spacing[1],
    padding: Spacing[4],
    borderRadius: Radius.card,
    borderWidth: 1,
    borderCurve: "continuous",
  },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  onDark: {
    color: Palette.textOnDark,
  },
  muted: {
    color: Palette.textTertiary,
  },
  featured: {
    color: Palette.primarySoft,
  },
  features: {
    gap: Spacing[2],
  },
});
