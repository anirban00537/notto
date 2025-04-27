import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
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
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const currentFlashcard = flashcards[currentIndex];

  // Interpolate rotation for front and back
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const rotateYBack = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
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

  return (
    <View style={styles.container}>
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
                ],
                position: isFlipped ? 'absolute' : 'relative',
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
                ],
                position: isFlipped ? 'relative' : 'absolute',
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
            onPress={() => setShowHints(!showHints)}
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
    width: '100%',
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#eee",
    backfaceVisibility: 'hidden',
  },
  flashcardBack: {
    backgroundColor: "#f8f8ff",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
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
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
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
