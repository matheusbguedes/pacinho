import {
  forwardRef,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { MatchCard } from "@/modules/match/components/match-card";
import type { MatchPerson } from "@/modules/match/types";

export type SwipeDeckHandle = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

type SwipeDeckProps = {
  people: MatchPerson[];
  width: number;
  height: number;
  onSwipe: (person: MatchPerson, action: "LIKE" | "PASS") => void;
  disabled?: boolean;
};

const SWIPE_THRESHOLD = 120;
const CARD_ACTION_INSET = 108;

type TopCardProps = {
  person: MatchPerson;
  nextPerson?: MatchPerson;
  disabled: boolean;
  cardWidth: number;
  cardHeight: number;
  windowWidth: number;
  onSwipe: (action: "LIKE" | "PASS") => void;
  deckRef: Ref<SwipeDeckHandle>;
};

function TopCardLayer({
  person,
  nextPerson,
  disabled,
  cardWidth,
  cardHeight,
  windowWidth,
  onSwipe,
  deckRef,
}: TopCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [failedUrl, setFailedUrl] = useState(false);

  function swipeProgrammatically(action: "LIKE" | "PASS") {
    if (disabled) {
      return;
    }

    const target = action === "LIKE" ? windowWidth * 1.5 : -windowWidth * 1.5;
    translateX.value = withTiming(target, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(onSwipe)(action);
      }
    });
  }

  useImperativeHandle(deckRef, () => ({
    swipeLeft: () => swipeProgrammatically("PASS"),
    swipeRight: () => swipeProgrammatically("LIKE"),
  }));

  function goPrevPhoto() {
    setPhotoIndex((current) => Math.max(0, current - 1));
    setFailedUrl(false);
  }

  function goNextPhoto() {
    const maxIndex = Math.max(person.media.length - 1, 0);
    setPhotoIndex((current) => Math.min(maxIndex, current + 1));
    setFailedUrl(false);
  }

  function handlePhotoTap(x: number) {
    if (person.media.length <= 1) {
      return;
    }

    if (x < cardWidth / 2) {
      goPrevPhoto();
      return;
    }

    goNextPhoto();
  }

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-18, 18])
    .failOffsetY([-28, 28])
    .onUpdate((event) => {
      "worklet";
      // Shared values are mutated intentionally in Reanimated worklets.
      /* eslint-disable react-hooks/immutability -- reanimated shared values */
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.12;
      /* eslint-enable react-hooks/immutability */
    })
    .onEnd(() => {
      "worklet";
      /* eslint-disable react-hooks/immutability -- reanimated shared values */
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          windowWidth * 1.5,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onSwipe)("LIKE");
            }
          },
        );
        return;
      }

      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -windowWidth * 1.5,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onSwipe)("PASS");
            }
          },
        );
        return;
      }

      translateX.value = withSpring(0, { damping: 18 });
      translateY.value = withSpring(0, { damping: 18 });
      /* eslint-enable react-hooks/immutability */
    });

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .maxDistance(12)
    .onEnd((event) => {
      runOnJS(handlePhotoTap)(event.x);
    });

  // Tap first so photo carousel wins; pan takes over when the finger moves.
  const gesture = Gesture.Exclusive(tap, pan);

  const topCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-windowWidth, 0, windowWidth],
      [-14, 0, 14],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [28, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotate: "-16deg" }],
  }));

  const passStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -28],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotate: "16deg" }],
  }));

  const nextCardStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      Math.abs(translateX.value),
      [0, 48, SWIPE_THRESHOLD],
      [0, 0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: progress,
      transform: [{ scale: 0.94 + progress * 0.06 }],
    };
  });

  return (
    <View style={[styles.deck, { width: cardWidth, height: cardHeight }]}>
      {nextPerson ? (
        <Animated.View
          style={[
            styles.cardSlot,
            { width: cardWidth, height: cardHeight },
            nextCardStyle,
          ]}
          pointerEvents="none"
        >
          <MatchCard
            person={nextPerson}
            photoIndex={0}
            width={cardWidth}
            height={cardHeight}
            contentInsetBottom={CARD_ACTION_INSET}
          />
        </Animated.View>
      ) : null}

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.cardSlot,
            { width: cardWidth, height: cardHeight },
            topCardStyle,
          ]}
        >
          <MatchCard
            person={person}
            photoIndex={photoIndex}
            width={cardWidth}
            height={cardHeight}
            contentInsetBottom={CARD_ACTION_INSET}
            failedUrl={failedUrl}
            onImageError={() => setFailedUrl(true)}
          />

          <Animated.View
            pointerEvents="none"
            style={[styles.stamp, styles.likeStamp, likeStampStyle]}
          >
            <ThemedText type="title" style={styles.likeText}>
              CURTI
            </ThemedText>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[styles.stamp, styles.passStamp, passStampStyle]}
          >
            <ThemedText type="title" style={styles.passText}>
              PASSO
            </ThemedText>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  function SwipeDeck({ people, width, height, onSwipe, disabled = false }, ref) {
    const topPerson = people[0];
    const nextPerson = people[1];

    if (!topPerson || width < 1 || height < 1) {
      return null;
    }

    return (
      <TopCardLayer
        key={topPerson.id}
        person={topPerson}
        nextPerson={nextPerson}
        disabled={disabled}
        cardWidth={width}
        cardHeight={height}
        windowWidth={width}
        deckRef={ref}
        onSwipe={(action) => onSwipe(topPerson, action)}
      />
    );
  },
);

const styles = StyleSheet.create({
  deck: {
    alignSelf: "center",
    overflow: "hidden",
    position: "relative",
  },
  cardSlot: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  stamp: {
    position: "absolute",
    top: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 10,
  },
  likeStamp: {
    left: 20,
    borderColor: "#2ECC71",
  },
  passStamp: {
    right: 20,
    borderColor: "#CD1835",
  },
  likeText: {
    color: "#2ECC71",
    letterSpacing: 2,
  },
  passText: {
    color: "#CD1835",
    letterSpacing: 2,
  },
});
