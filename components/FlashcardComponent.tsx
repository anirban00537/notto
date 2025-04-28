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
                <MaterialCommunityIcons
                  name="rotate-3d-variant"
                  size={18}
                  color="#B0B0B0"
                  style={styles.flipIndicator}
                />
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
        </View>
        <View style={styles.hintsContainer}>
          {currentFlashcard.hints && currentFlashcard.hints.length > 0 ? (
            currentFlashcard.hints.map((hint, i) => (
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
        </View>
      </View>

      {/* Navigation Hint */}
      <Text style={styles.swipeHint}>Swipe left or right to navigate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3a4d6d",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#555",
    fontSize: 13,
    fontWeight: "500",
  },
  swipeContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  flipTouchable: {
    width: SCREEN_WIDTH * 0.88,
    aspectRatio: 16 / 11,
    marginBottom: 24,
  },
  flashcardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  flashcardBack: {
    backgroundColor: "#FDFDFD",
  },
  question: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 20,
  },
  flipIndicator: {
    position: "absolute",
    bottom: 18,
    opacity: 0.6,
  },
  answerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  answer: {
    fontSize: 20,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 28,
  },
  hintsSection: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
  },
  hintsHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  hintsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a4a4a",
  },
  hintsContainer: {
    width: "100%",
    paddingHorizontal: 18,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  hintText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginLeft: 10,
    flex: 1,
    lineHeight: 21,
  },
  noHintsText: {
    textAlign: "center",
    color: "#AAA",
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: 10,
  },
  swipeHint: {
    color: "#B0B0B0",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
    paddingBottom: 8,
  },
});
