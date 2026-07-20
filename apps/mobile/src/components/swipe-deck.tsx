import { useState } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import type { Product } from '@iraya/supabase-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type SwipeAction = 'save' | 'skip';

type SwipeDeckProps = {
  products: Product[];
  onSwipe: (product: Product, action: SwipeAction) => void;
  onEmpty?: () => void;
};

export function SwipeDeck({ products, onSwipe, onEmpty }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);

  const current = products[index];
  const next = products[index + 1];

  function advance(product: Product, action: SwipeAction) {
    onSwipe(product, action);
    setIndex((i) => i + 1);
  }

  if (!current) {
    onEmpty?.();
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText type="subtitle">You&apos;re all caught up</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Check back later for more finds.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.deck}>
      {next && <Card key={next.id} product={next} isTop={false} />}
      <Card key={current.id} product={current} isTop onDecide={(action) => advance(current, action)} />
    </ThemedView>
  );
}

function Card({
  product,
  isTop,
  onDecide,
}: {
  product: Product;
  isTop: boolean;
  onDecide?: (action: SwipeAction) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSave = event.translationX > SWIPE_THRESHOLD;
      const shouldSkip = event.translationX < -SWIPE_THRESHOLD;

      if (shouldSave || shouldSkip) {
        const action: SwipeAction = shouldSave ? 'save' : 'skip';
        translateX.value = withTiming(
          shouldSave ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { duration: 220 },
          (finished) => {
            if (finished && onDecide) {
              runOnJS(onDecide)(action);
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: isTop ? 1 : 0.95 },
      ],
    };
  });

  const saveBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const skipBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const cardContent = (
    <Animated.View style={[styles.card, cardStyle]}>
      <ThemedView type="backgroundElement" style={styles.cardInner}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.image} />
        )}

        {isTop && (
          <>
            <Animated.View style={[styles.badge, styles.saveBadge, saveBadgeStyle]}>
              <ThemedText type="smallBold" style={styles.badgeText}>
                SAVE
              </ThemedText>
            </Animated.View>
            <Animated.View style={[styles.badge, styles.skipBadge, skipBadgeStyle]}>
              <ThemedText type="smallBold" style={styles.badgeText}>
                SKIP
              </ThemedText>
            </Animated.View>
          </>
        )}

        <ThemedView style={styles.info}>
          <ThemedText type="default" numberOfLines={1}>
            {product.title}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Rs.{product.price}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Animated.View>
  );

  if (!isTop) {
    return cardContent;
  }

  return <GestureDetector gesture={pan}>{cardContent}</GestureDetector>;
}

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - Spacing.four * 2,
    aspectRatio: 3 / 4,
  },
  cardInner: {
    flex: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
  },
  badge: {
    position: 'absolute',
    top: Spacing.four,
    borderWidth: 3,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  saveBadge: {
    left: Spacing.three,
    borderColor: '#3ddc84',
    transform: [{ rotate: '-15deg' }],
  },
  skipBadge: {
    right: Spacing.three,
    borderColor: '#ff4d4d',
    transform: [{ rotate: '15deg' }],
  },
  badgeText: {
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
});