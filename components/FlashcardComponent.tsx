import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  FadeIn,
  ZoomIn,
  SlideInRight,
  SlideInLeft,
  SlideInDown,
} from "react-native-reanimated";
import { UIFlashcard } from "../lib/utils/flashcardMapper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface FlashcardComponentProps {
  flashcards: UIFlashcard[];
}

export default function FlashcardComponent({
  flashcards,
}: FlashcardComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleHintCount, setVisibleHintCount] = useState(1);
  const isFlipped = useSharedValue(false);
  const flipAnim = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  const hasFlashcards = flashcards && flashcards.length > 0;
  const currentFlashcard = hasFlashcards ? flashcards[currentIndex] : null;
  const progress = hasFlashcards
    ? ((currentIndex + 1) / flashcards.length) * 100
    : 0;

  useEffect(() => {
    progressAnim.value = withTiming(progress / 100, { duration: 600 });
  }, [currentIndex, flashcards]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value * 100}%`,
    };
  });

  const animatedFrontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      position: isFlipped.value ? "absolute" : "relative",
      opacity: interpolate(flipAnim.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0]),
      zIndex: isFlipped.value ? 0 : 1,
    };
  });

  const animatedBackStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      position: isFlipped.value ? "relative" : "absolute",
      opacity: interpolate(flipAnim.value, [0, 0.5, 0.5, 1], [0, 0, 1, 1]),
      zIndex: isFlipped.value ? 1 : 0,
    };
  });

  const handleFlip = () => {
    isFlipped.value = !isFlipped.value;
    flipAnim.value = withTiming(isFlipped.value ? 1 : 0, { duration: 400 });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotateVal = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );
    rotateZ.value = rotateVal;

    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
    };
  });

  const goToNextCard = () => {
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
    resetCardState();
  };

  const goToPrevCard = () => {
    const prevIndex =
      (currentIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentIndex(prevIndex);
    resetCardState();
  };

  const resetCardState = () => {
    translateX.value = 0;
    rotateZ.value = 0;
    flipAnim.value = 0;
    isFlipped.value = false;
    setVisibleHintCount(1);
  };

  const showMoreHints = () => {
    if (
      currentFlashcard?.hints &&
      visibleHintCount < currentFlashcard.hints.length
    ) {
      setVisibleHintCount(visibleHintCount + 1);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(
          direction * SCREEN_WIDTH * 1.2,
          { duration: 250 },
          () => {
            if (direction === 1) {
              runOnJS(goToPrevCard)();
            } else {
              runOnJS(goToNextCard)();
            }
          }
        );
        rotateZ.value = withTiming(direction * 20, { duration: 200 });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        rotateZ.value = withTiming(0, { duration: 200 });
      }
    });

  const getAnswerFontSize = (text: string | undefined) => {
    if (!text) return 20;
    if (text.length > 200) return 16;
    if (text.length > 120) return 18;
    return 20;
  };

  if (!hasFlashcards) {
    return (
      <Reanimated.View
        style={styles.emptyContainer}
        entering={FadeIn.duration(400)}
      >
        <Reanimated.View
          style={styles.emptyCard}
          entering={ZoomIn.delay(300).duration(600)}
        >
          <MaterialCommunityIcons name="cards-outline" size={60} color="#999" />
          <Text style={styles.emptyTitle}>No Flashcards Available</Text>
          <Text style={styles.emptyText}>
            There are no flashcards available for this note yet.
          </Text>
        </Reanimated.View>
      </Reanimated.View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Reanimated.View style={styles.container} entering={FadeIn.duration(300)}>
        {/* Progress Bar */}
        <Reanimated.View
          style={styles.progressContainer}
          entering={SlideInDown.duration(400)}
        >
          <View style={styles.progressBackground}>
            <Reanimated.View
              style={[styles.progressFill, progressAnimatedStyle]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {flashcards.length}
          </Text>
        </Reanimated.View>

        {/* Flashcard */}
        <GestureDetector gesture={panGesture}>
          <Reanimated.View style={[styles.swipeContainer, cardAnimatedStyle]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleFlip}
              style={styles.flipTouchable}
            >
              <View>
                <Reanimated.View
                  style={[styles.flashcardContainer, animatedFrontStyle]}
                  entering={
                    currentIndex % 2 === 0
                      ? SlideInRight.duration(300)
                      : SlideInLeft.duration(300)
                  }
                >
                  <View style={styles.cardContentContainer}>
                    <Text style={styles.questionLabel}>Question</Text>
                    <Text style={styles.question}>
                      {currentFlashcard?.question}
                    </Text>
                  </View>
                  <View style={styles.flipIndicatorContainer}>
                    <MaterialCommunityIcons
                      name="rotate-3d-variant"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.tapToFlip}>Tap to flip</Text>
                  </View>
                </Reanimated.View>

                <Reanimated.View
                  style={[
                    styles.flashcardContainer,
                    styles.flashcardBack,
                    animatedBackStyle,
                  ]}
                >
                  <View style={styles.cardContentContainer}>
                    <Text style={styles.answerLabel}>Answer</Text>
                    <Text
                      style={[
                        styles.answer,
                        {
                          fontSize: getAnswerFontSize(currentFlashcard?.answer),
                        },
                      ]}
                    >
                      {currentFlashcard?.answer}
                    </Text>
                  </View>
                  <View style={styles.flipIndicatorContainer}>
                    <MaterialCommunityIcons
                      name="rotate-3d-variant"
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.tapToFlip}>Tap to flip back</Text>
                  </View>
                </Reanimated.View>
              </View>
            </TouchableOpacity>
          </Reanimated.View>
        </GestureDetector>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPrevCard}
            disabled={flashcards.length <= 1}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={flashcards.length > 1 ? "#000" : "#ccc"}
            />
          </TouchableOpacity>

          <Text style={styles.cardIndicator}>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextCard}
            disabled={flashcards.length <= 1}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={flashcards.length > 1 ? "#000" : "#ccc"}
            />
          </TouchableOpacity>
        </View>

        {/* Hints Section */}
        <Reanimated.View
          style={styles.hintsSection}
          entering={SlideInDown.delay(300).duration(400)}
        >
          <View style={styles.hintsHeader}>
            <Text style={styles.hintsTitle}>Hints</Text>
          </View>
          <View style={styles.hintsContainer}>
            {currentFlashcard?.hints && currentFlashcard.hints.length > 0 ? (
              <>
                {currentFlashcard.hints
                  .slice(0, visibleHintCount)
                  .map((hint, i) => (
                    <Reanimated.View
                      key={`hint-${i}`}
                      style={styles.hintRow}
                      entering={FadeIn.delay(i * 200).duration(300)}
                    >
                      <MaterialCommunityIcons
                        name="lightbulb-outline"
                        size={18}
                        color="#f59e0b"
                      />
                      <Text style={styles.hintText}>{hint}</Text>
                    </Reanimated.View>
                  ))}
                {visibleHintCount < currentFlashcard.hints.length && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={showMoreHints}
                  >
                    <Text style={styles.showMoreText}>
                      Show more hints (
                      {currentFlashcard.hints.length - visibleHintCount}{" "}
                      remaining)
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={16}
                      color="#444"
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.noHintsText}>
                No hints available for this card.
              </Text>
            )}
          </View>
        </Reanimated.View>

        {/* Swipe Instructions */}
        <View style={styles.instructionsContainer}>
          <MaterialCommunityIcons
            name="gesture-swipe-horizontal"
            size={20}
            color="#666"
          />
          <Text style={styles.swipeHint}>Swipe left or right to navigate</Text>
        </View>
      </Reanimated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT - 220,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 28,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#f1f1f1",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 2,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#666",
    fontSize: 14,
    fontWeight: "400",
  },
  swipeContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 340,
  },
  flipTouchable: {
    width: SCREEN_WIDTH * 0.88,
    aspectRatio: 3 / 2,
    marginBottom: 20,
  },
  flashcardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flashcardBack: {
    backgroundColor: "#fff",
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: "500",
    color: "#111",
    textAlign: "center",
    lineHeight: 32,
  },
  flipIndicatorContainer: {
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
  },
  flipIndicator: {
    marginRight: 6,
  },
  tapToFlip: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  answer: {
    color: "#111",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIndicator: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  hintsSection: {
    width: "100%",
    padding: 0,
    marginTop: 0,
  },
  hintsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  hintsTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#111",
  },
  hintsContainer: {
    width: "100%",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff9eb",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 15,
    color: "#704008",
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  showMoreText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "400",
    marginRight: 6,
  },
  noHintsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    fontStyle: "italic",
    paddingVertical: 16,
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  swipeHint: {
    color: "#666",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "400",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: SCREEN_HEIGHT - 240,
    padding: 20,
  },
  emptyCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
