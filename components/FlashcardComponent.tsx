import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4; // Threshold to trigger swipe

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
  const [showHints, setShowHints] = useState(false);
  const [visibleHintCount, setVisibleHintCount] = useState(1);
  // Use shared values for animations
  const isFlipped = useSharedValue(false);
  const flipAnim = useSharedValue(0); // 0 for front, 1 for back
  const translateX = useSharedValue(0); // For swipe gesture
  const rotateZ = useSharedValue(0); // For card rotation during swipe

  const currentFlashcard = flashcards[currentIndex];

  // --- Flip Animation Logic (Reanimated) ---
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

  // --- Swipe Gesture Logic (Setup) ---
  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Rotate card slightly during swipe
    const rotateVal = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );
    rotateZ.value = rotateVal; // Update rotateZ for potential future use/sync

    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
    };
  });

  const goToNextCard = () => {
    // Needs to be run on JS thread
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
    resetCardState();
  };

  const goToPrevCard = () => {
    // Needs to be run on JS thread
    const prevIndex =
      (currentIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentIndex(prevIndex);
    resetCardState();
  };

  const resetCardState = () => {
    // Reset shared values non-animated for new card
    translateX.value = 0;
    rotateZ.value = 0;
    flipAnim.value = 0;
    isFlipped.value = false;
    // Reset component state
    setShowHints(false);
    setVisibleHintCount(1);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 1 : -1; // 1 for right, -1 for left
        // Animate card off screen
        translateX.value = withTiming(
          direction * SCREEN_WIDTH * 1.2, // Move further than screen width
          { duration: 250 },
          () => {
            // Callback after animation completes
            if (direction === 1) {
              // Swiped Right (-> Previous Card)
              runOnJS(goToPrevCard)();
            } else {
              // Swiped Left (-> Next Card)
              runOnJS(goToNextCard)();
            }
          }
        );
        // Optionally add rotation during exit animation
        rotateZ.value = withTiming(direction * 20, { duration: 250 });
      } else {
        // Snap back to center
        translateX.value = withTiming(0, { duration: 200 });
        rotateZ.value = withTiming(0, { duration: 200 });
      }
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.swipeContainer, cardAnimatedStyle]}>
          {/* Flip Card */}
          <TouchableOpacity
            activeOpacity={1} // Less feedback needed as swipe is main interaction
            onPress={handleFlip}
            style={styles.flipTouchable}
          >
            <View>
              {/* Card Front */}
              <Reanimated.View
                style={[styles.flashcardContainer, animatedFrontStyle]}
              >
                <Text style={styles.question}>{currentFlashcard.question}</Text>
              </Reanimated.View>

              {/* Card Back */}
              <Reanimated.View
                style={[
                  styles.flashcardContainer,
                  styles.flashcardBack,
                  animatedBackStyle,
                ]}
              >
                <Text style={styles.answerTitle}>Answer</Text>
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{currentFlashcard.answer}</Text>
                </View>
              </Reanimated.View>
            </View>
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>

      {/* Hints and Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.centerButtons}>
          <TouchableOpacity
            onPress={() => {
              // Reset flip state if hints are opened/closed while card is flipped
              if (isFlipped.value) {
                handleFlip(); // Flip back to front smoothly
              }
              setShowHints((prev) => !prev);
            }}
            style={styles.hintButton}
          >
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={20}
              color="#2c3e50"
            />
            <Text style={styles.buttonText}>Hints</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.counterText}>
        {currentIndex + 1} / {flashcards.length}
      </Text>

      {/* Hints shown at bottom, outside the card */}
      {showHints &&
        currentFlashcard.hints &&
        currentFlashcard.hints.length > 0 && (
          <View style={styles.hintsContainerBottom}>
            <Text style={styles.hintsTitle}>Hints</Text>
            {currentFlashcard.hints
              .slice(0, visibleHintCount)
              .map((hint, i) => (
                <View key={`hint-${i}`} style={styles.hintRow}>
                  <View style={styles.hintDot} />
                  <Text style={styles.hintText}>{hint}</Text>
                </View>
              ))}
            {visibleHintCount < currentFlashcard.hints.length && (
              <TouchableOpacity
                style={styles.moreHintButton}
                onPress={() => setVisibleHintCount((prev) => prev + 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.moreHintText}>More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center", // Adjust alignment for swipe container
    overflow: "hidden", // Prevent swiped card from showing outside bounds prematurely
  },
  swipeContainer: {
    width: "100%",
    alignItems: "center", // Center the flipTouchable within the swipe container
  },
  flipTouchable: {
    width: "95%", // Make card slightly smaller than container
    minHeight: 250, // Increase min height for better presence
    marginBottom: 12,
    // Add subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flashcardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    minHeight: 250, // Match flipTouchable
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    backfaceVisibility: "hidden",
  },
  flashcardBack: {
    backgroundColor: "#f8f8ff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "center",
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  answerContainer: {
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  answer: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  hintsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  hintsContainerBottom: {
    marginTop: 24,
    padding: 18,
    backgroundColor: "#f0f6ff",
    borderRadius: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e3eaf5",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },

  moreHintButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#2c3e50",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  moreHintText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  hintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2c3e50",
    marginRight: 8,
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center", // Center the remaining buttons
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  centerButtons: {
    flexDirection: "row",
    justifyContent: "center", // Ensure buttons are centered
    gap: 16,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e8f0fe", // Lighter blue for subtle highlight
    borderWidth: 1,
    borderColor: "#d6e4ff",
  },
  buttonText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  counterText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
