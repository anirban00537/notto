import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";

type FlashcardType = {
  id: string;
  front: string;
  back: string;
};

type FlashcardsComponentProps = {
  flashcards: FlashcardType[];
  title: string;
};

const { width } = Dimensions.get("window");

export default function FlashcardsComponent({
  flashcards,
  title,
}: FlashcardsComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const flipCard = () => {
    if (isFlipped) {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(false));
    } else {
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsFlipped(true));
    }
  };

  const nextCard = () => {
    if (isFlipped) {
      // First flip card back
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(false);
        // Then move to next card
        setTimeout(() => {
          setCurrentIndex((prev) =>
            prev < flashcards.length - 1 ? prev + 1 : prev
          );
        }, 100);
      });
    } else {
      // Just move to next card
      setCurrentIndex((prev) =>
        prev < flashcards.length - 1 ? prev + 1 : prev
      );
    }
  };

  const prevCard = () => {
    if (isFlipped) {
      // First flip card back
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(false);
        // Then move to previous card
        setTimeout(() => {
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }, 100);
      });
    } else {
      // Just move to previous card
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  // Front-to-back flip animation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={Typography.body1}>No flashcards available</Text>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
          <Animated.View
            style={[styles.card, styles.frontCard, frontAnimatedStyle]}
          >
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <View style={styles.flipHint}>
              <MaterialCommunityIcons
                name="rotate-3d-variant"
                size={18}
                color={Colors.light.secondaryText}
              />
              <Text style={styles.flipHintText}>Tap to flip</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.backCard,
              backAnimatedStyle,
              styles.backCardContent,
            ]}
          >
            <Text style={styles.cardText}>{currentCard.back}</Text>
            <View style={styles.flipHint}>
              <MaterialCommunityIcons
                name="rotate-3d-variant"
                size={18}
                color={Colors.light.secondaryText}
              />
              <Text style={styles.flipHintText}>Tap to flip</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.disabledButton,
          ]}
          onPress={prevCard}
          disabled={currentIndex === 0}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={
              currentIndex === 0
                ? Colors.light.secondaryText
                : Colors.light.text
            }
          />
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.disabledButtonText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === flashcards.length - 1 && styles.disabledButton,
          ]}
          onPress={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === flashcards.length - 1 &&
                styles.disabledButtonText,
            ]}
          >
            Next
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={
              currentIndex === flashcards.length - 1
                ? Colors.light.secondaryText
                : Colors.light.text
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: Colors.light.text,
  },
  counter: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.light.secondaryText,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    height: 300,
  },
  card: {
    width: width - 64,
    height: 320,
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    position: "absolute",
    top: 0,
  },
  frontCard: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  backCard: {
    backgroundColor: Colors.light.tintBackground,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  backCardContent: {
    justifyContent: "center",
  },
  cardText: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.light.text,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
  flipHint: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  flipHintText: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    marginTop: 40,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  navButtonText: {
    color: Colors.light.text,
    fontFamily: FONTS.medium,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: Colors.light.secondaryText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
