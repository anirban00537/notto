import React, { useState } from "react";
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
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Flashcard = {
  question: string;
  answer: string;
  hints?: string[];
};

interface FlashcardComponentProps {
  flashcards: Flashcard[];
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

  const currentFlashcard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

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

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
      </View>

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
              >
                <Text style={styles.question}>{currentFlashcard.question}</Text>
                <Text style={styles.tapToFlip}>Tap to flip</Text>
              </Reanimated.View>

              <Reanimated.View
                style={[
                  styles.flashcardContainer,
                  styles.flashcardBack,
                  animatedBackStyle,
                ]}
              >
                <Text style={styles.answerTitle}>Answer</Text>
                <Text style={styles.answer}>{currentFlashcard.answer}</Text>
              </Reanimated.View>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>

      {/* Hints Section */}
      <View style={styles.hintsSection}>
        <View style={styles.hintsHeader}>
          <Text style={styles.hintsTitle}>Hints</Text>
          {currentFlashcard.hints &&
            visibleHintCount < currentFlashcard.hints.length && (
              <TouchableOpacity
                onPress={() => setVisibleHintCount((prev) => prev + 1)}
                style={styles.moreHintsButton}
              >
                <Text style={styles.moreHintsText}>Show More</Text>
              </TouchableOpacity>
            )}
        </View>
        <ScrollView style={styles.hintsContainer}>
          {currentFlashcard.hints && currentFlashcard.hints.length > 0 ? (
            currentFlashcard.hints.slice(0, visibleHintCount).map((hint, i) => (
              <View key={`hint-${i}`} style={styles.hintRow}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={16}
                  color="#2c3e50"
                />
                <Text style={styles.hintText}>{hint}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noHintsText}>
              No hints available for this card.
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Navigation Hint */}
      <Text style={styles.swipeHint}>Swipe left or right to navigate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2c3e50",
    borderRadius: 3,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  swipeContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
  },
  flipTouchable: {
    width: SCREEN_WIDTH * 0.85,
    aspectRatio: 3 / 4,
    marginBottom: 12,
  },
  flashcardContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flashcardBack: {
    backgroundColor: "#f8f9fa",
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 28,
  },
  tapToFlip: {
    position: "absolute",
    bottom: 20,
    color: "#999",
    fontSize: 12,
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  answer: {
    fontSize: 18,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 26,
  },
  hintsSection: {
    width: "100%",
    maxHeight: "30%",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  hintsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  moreHintsButton: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moreHintsText: {
    color: "#2c3e50",
    fontSize: 12,
    fontWeight: "500",
  },
  hintsContainer: {
    maxHeight: 150,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  hintText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginLeft: 8,
    flex: 1,
  },
  noHintsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  swipeHint: {
    color: "#999",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },
});
