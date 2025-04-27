import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const currentFlashcard = flashcards[currentIndex];

  // Interpolate rotation for front and back
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const rotateYBack = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const handleFlip = () => {
    if (!isFlipped) {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    } else {
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    }
  };

  const handleNext = () => {
    setShowHints(false);
    setVisibleHintCount(1);
    setIsFlipped(false);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setShowHints(false);
    setVisibleHintCount(1);
    setIsFlipped(false);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        swipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 120) {
          Animated.timing(swipeAnim, {
            toValue: gestureState.dx > 0 ? 300 : -300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipeAnim.setValue(0);
            gestureState.dx > 0 ? handlePrev() : handleNext();
          });
        } else {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Flip Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFlip}
        style={styles.flipTouchable}
      >
        <View>
          {/* Card Front */}
          <Animated.View
            style={[
              styles.flashcardContainer,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: rotateY },
                  { translateX: swipeAnim },
                ],
                position: isFlipped ? "absolute" : "relative",
                opacity: isFlipped ? 0 : 1,
                zIndex: isFlipped ? 0 : 1,
              },
            ]}
          >
            <Text style={styles.question}>{currentFlashcard.question}</Text>
          </Animated.View>

          {/* Card Back */}
          <Animated.View
            style={[
              styles.flashcardContainer,
              styles.flashcardBack,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: rotateYBack },
                  { translateX: swipeAnim },
                ],
                position: isFlipped ? "relative" : "absolute",
                opacity: isFlipped ? 1 : 0,
                zIndex: isFlipped ? 1 : 0,
              },
            ]}
          >
            <Text style={styles.answerTitle}>Answer</Text>
            <View style={styles.answerContainer}>
              <Text style={styles.answer}>{currentFlashcard.answer}</Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Hints and Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#2c3e50"
          />
        </TouchableOpacity>

        <View style={styles.centerButtons}>
          <TouchableOpacity
            onPress={() => setShowHints((prev) => !prev)}
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

        <TouchableOpacity onPress={handleNext} style={styles.navButton}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#2c3e50"
          />
        </TouchableOpacity>
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
    justifyContent: "center",
  },
  flipTouchable: {
    width: "100%",
    minHeight: 200,
    marginBottom: 12,
  },
  flashcardContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "100%",
    minHeight: 200,
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  navButton: {
    padding: 10,
  },
  centerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f7ff",
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
