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
  RollInRight,
  RollInLeft,
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
  console.log(flashcards, "s>>>>>");
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
          <MaterialCommunityIcons
            name="cards-outline"
            size={60}
            color="#b5c7d3"
          />
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
                      ? RollInRight.duration(400)
                      : RollInLeft.duration(400)
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
                      size={24}
                      color="#64748b"
                      style={styles.flipIndicator}
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
                    <Text style={styles.answer}>
                      {currentFlashcard?.answer}
                    </Text>
                  </View>
                  <View style={styles.flipIndicatorContainer}>
                    <MaterialCommunityIcons
                      name="rotate-3d-variant"
                      size={24}
                      color="#64748b"
                      style={styles.flipIndicator}
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
              size={28}
              color={flashcards.length > 1 ? "#3a4d6d" : "#ccc"}
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
              size={28}
              color={flashcards.length > 1 ? "#3a4d6d" : "#ccc"}
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
                        size={20}
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
                      size={18}
                      color="#3a4d6d"
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
            size={22}
            color="#64748b"
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
    backgroundColor: "#f0f7ff",
  },
  scrollContent: {
    minHeight: SCREEN_HEIGHT - 240,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 24,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#e6f0ff",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3a4d6d",
    borderRadius: 3,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  swipeContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  flipTouchable: {
    width: SCREEN_WIDTH * 0.88,
    aspectRatio: 16 / 11,
    marginBottom: 16,
  },
  flashcardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  flashcardBack: {
    backgroundColor: "#FDFDFD",
    borderColor: "#e2e8f0",
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 32,
  },
  flipIndicatorContainer: {
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  flipIndicator: {
    marginBottom: 4,
  },
  tapToFlip: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  answer: {
    fontSize: 20,
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 30,
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIndicator: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  hintsSection: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hintsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  hintsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  hintsContainer: {
    width: "100%",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef3c7",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  hintText: {
    fontSize: 15,
    color: "#92400e",
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
    color: "#3a4d6d",
    fontWeight: "500",
    marginRight: 6,
  },
  noHintsText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 15,
    fontStyle: "italic",
    paddingVertical: 16,
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  swipeHint: {
    color: "#64748b",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
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
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 300,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
});
