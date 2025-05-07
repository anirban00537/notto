import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";
import { useNoteDetail } from "@/hooks/useNoteDetail";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function FlashcardsScreen() {
  const router = useRouter();
  const { noteId, title } = useLocalSearchParams<{
    noteId: string;
    title: string;
  }>();

  const { note, loading, isGenerating, handleGenerateMaterials } =
    useNoteDetail(noteId);

  // Flashcard state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [visibleHintCount, setVisibleHintCount] = React.useState(1);
  const isFlipped = useSharedValue(false);
  const flipAnim = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const iconRotate = useSharedValue(0);

  const handleBackPress = () => {
    router.back();
  };

  const flashcards = note?.flashcards || [];
  const hasFlashcards = flashcards && flashcards.length > 0;
  const currentFlashcard = hasFlashcards ? flashcards[currentIndex] : null;
  const progress = hasFlashcards
    ? ((currentIndex + 1) / flashcards.length) * 100
    : 0;

  React.useEffect(() => {
    progressAnim.value = withTiming(progress / 100, { duration: 600 });
  }, [currentIndex, flashcards]);

  // Animation for flip indicator - simplified to avoid worklet issues
  const animateFlipIcon = () => {
    iconRotate.value = 0;
    iconRotate.value = withTiming(1, { duration: 1500 });
  };

  // Trigger the animation when isFlipped changes
  React.useEffect(() => {
    // Set up a listener to react to flipped state changes
    const listener = () => {
      animateFlipIcon();
    };

    // Clean up on unmount
    return () => {
      iconRotate.value = 0;
    };
  }, []);

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
      backgroundColor: isFlipped.value ? Colors.light.tintLight + "20" : "#fff",
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateY: `${interpolate(
            iconRotate.value,
            [0, 0.5, 1],
            [0, 180, 360]
          )}deg`,
        },
      ],
    };
  });

  const handleFlip = () => {
    isFlipped.value = !isFlipped.value;
    flipAnim.value = withTiming(isFlipped.value ? 1 : 0, { duration: 400 });

    // Animate flip icon when flipping
    animateFlipIcon();

    // Reset visible hint count when flipping back to question side
    if (!isFlipped.value) {
      setVisibleHintCount(1);
    }
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

  // Create a dynamic style for the back of the card to avoid errors
  const backCardStyle = React.useMemo(() => {
    return [
      styles.flashcardContainer,
      styles.flashcardBack,
      isFlipped.value ? styles.flashcardBackActive : {},
      animatedBackStyle,
    ];
  }, [animatedBackStyle]); // We don't need isFlipped.value in dependencies as it's automatically tracked by animatedBackStyle

  if (loading) return <LoadingScreen />;
  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={Typography.body1}>Note not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButtonContainer}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Flashcards</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <LoadingScreen />
          </View>
        ) : hasFlashcards ? (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Reanimated.View
              style={styles.container}
              entering={FadeIn.duration(300)}
            >
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
                <Reanimated.View
                  style={[styles.swipeContainer, cardAnimatedStyle]}
                >
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
                          <Text style={[Typography.h3, styles.question]}>
                            {currentFlashcard?.question}
                          </Text>
                        </View>
                        <View style={styles.flipIndicatorContainer}>
                          <Reanimated.View style={iconAnimatedStyle}>
                            <MaterialCommunityIcons
                              name="rotate-3d-variant"
                              size={20}
                              color="#666"
                            />
                          </Reanimated.View>
                          <Text style={styles.tapToFlip}>Tap to flip</Text>
                        </View>
                      </Reanimated.View>

                      <Reanimated.View style={backCardStyle}>
                        <View style={styles.cardContentContainer}>
                          <Text style={styles.answerLabel}>Answer</Text>
                          <Text
                            style={[
                              Typography.body1,
                              styles.answer,
                              {
                                fontSize: getAnswerFontSize(
                                  currentFlashcard?.answer
                                ),
                              },
                            ]}
                          >
                            {currentFlashcard?.answer}
                          </Text>
                        </View>
                        <View style={styles.flipIndicatorContainer}>
                          <Reanimated.View style={iconAnimatedStyle}>
                            <MaterialCommunityIcons
                              name="rotate-3d-variant"
                              size={20}
                              color={Colors.light.tint}
                            />
                          </Reanimated.View>
                          <Text
                            style={[
                              styles.tapToFlip,
                              { color: Colors.light.tint },
                            ]}
                          >
                            Tap to flip back
                          </Text>
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

                <Text style={[Typography.body2, styles.cardIndicator]}>
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
                  <Text style={[Typography.h4, styles.hintsTitle]}>Hints</Text>
                </View>
                <View style={styles.hintsContainer}>
                  {currentFlashcard?.hints &&
                  currentFlashcard.hints.length > 0 ? (
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
                            <Text style={[Typography.body1, styles.hintText]}>
                              {hint}
                            </Text>
                          </Reanimated.View>
                        ))}
                      {visibleHintCount < currentFlashcard.hints.length && (
                        <TouchableOpacity
                          style={styles.showMoreButton}
                          onPress={showMoreHints}
                        >
                          <Text style={[Typography.body2, styles.showMoreText]}>
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
                    <Text style={[Typography.body1, styles.noHintsText]}>
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
                <Text style={[Typography.body2, styles.swipeHint]}>
                  Swipe left or right to navigate
                </Text>
              </View>
            </Reanimated.View>
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              iconName="card-text-outline"
              message="No flashcards available yet."
              description="Generate flashcards based on your note content to help you study more effectively."
              buttonText="Generate Quiz & Flashcards"
              onPress={handleGenerateMaterials}
              loading={isGenerating}
              disabled={isGenerating}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  backButtonContainer: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: Colors.light.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.light.background,
    fontFamily: FONTS.medium,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    fontFamily: FONTS.regular,
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
    borderColor: Colors.light.tintLight,
  },
  flashcardBackActive: {
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
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
    color: "#111",
    textAlign: "center",
    lineHeight: 32,
  },
  flipIndicatorContainer: {
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    paddingVertical: 4,
  },
  flipIndicator: {
    marginRight: 6,
  },
  tapToFlip: {
    fontSize: 13,
    color: "#666",
    fontFamily: FONTS.regular,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.light.tint,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  answer: {
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: FONTS.medium,
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
    color: "#666",
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
    color: "#444",
    marginRight: 6,
  },
  noHintsText: {
    textAlign: "center",
    color: "#888",
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
    marginLeft: 8,
  },
});
