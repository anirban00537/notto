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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type Quiz = {
  title: string;
  questions: Question[];
};

interface QuizComponentProps {
  quiz: Quiz;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const progressValue = useSharedValue(0);
  const shake = useSharedValue(0);
  const bounce = useSharedValue(0);

  const hasQuestions = quiz.questions && quiz.questions.length > 0;
  const currentQuestion = hasQuestions
    ? quiz.questions[currentQuestionIndex]
    : null;
  const isLastQuestion = hasQuestions
    ? currentQuestionIndex === quiz.questions.length - 1
    : false;
  const progress = hasQuestions
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;

  useEffect(() => {
    // Animate progress bar when current question changes
    progressValue.value = withTiming(progress / 100, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [currentQuestionIndex, quiz.questions]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shake.value }],
    };
  });

  const bounceAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bounce.value }],
    };
  });

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);

    // Animate based on correct/incorrect answer
    if (answer === currentQuestion?.correctAnswer) {
      bounce.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      setScore(score + 1);
    } else {
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    // Show explanation with slight delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
  };

  if (!hasQuestions) {
    return (
      <Animated.View
        style={styles.emptyContainer}
        entering={FadeIn.duration(400)}
      >
        <Animated.View
          style={styles.emptyCard}
          entering={ZoomIn.delay(300).duration(600)}
        >
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={60}
            color="#b5c7d3"
          />
          <Text style={styles.emptyTitle}>No Quiz Available</Text>
          <Text style={styles.emptyText}>
            There are no quiz questions available for this note yet.
          </Text>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View style={styles.container} entering={FadeIn.duration(300)}>
        <View style={styles.header}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBarFill, progressAnimatedStyle]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
        </View>

        <Animated.View
          style={[styles.questionCard, shakeAnimatedStyle]}
          entering={SlideInRight.duration(300)}
        >
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={24}
            color="#2c3e50"
            style={styles.questionIcon}
          />
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion?.options.map((option, index) => (
              <AnimatedTouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.selectedOption,
                  showExplanation &&
                    option === currentQuestion.correctAnswer &&
                    styles.correctOption,
                  showExplanation &&
                    selectedAnswer === option &&
                    option !== currentQuestion.correctAnswer &&
                    styles.incorrectOption,
                ]}
                onPress={() => !showExplanation && handleAnswerSelect(option)}
                disabled={showExplanation}
                entering={FadeIn.delay(200 + index * 100).duration(300)}
              >
                <Text
                  style={[
                    styles.optionText,
                    showExplanation &&
                      option === currentQuestion.correctAnswer &&
                      styles.correctOptionText,
                    showExplanation &&
                      selectedAnswer === option &&
                      option !== currentQuestion.correctAnswer &&
                      styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>
                {showExplanation &&
                  option === currentQuestion.correctAnswer && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#4caf50"
                    />
                  )}
                {showExplanation &&
                  selectedAnswer === option &&
                  option !== currentQuestion.correctAnswer && (
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color="#f44336"
                    />
                  )}
              </AnimatedTouchableOpacity>
            ))}
          </View>

          {showExplanation && (
            <Animated.View
              style={styles.explanationContainer}
              entering={FadeIn.duration(400)}
            >
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={22}
                color="#f39c12"
                style={styles.explanationIcon}
              />
              <Text style={styles.explanationText}>
                {currentQuestion?.explanation}
              </Text>

              {!isLastQuestion ? (
                <Animated.View style={bounceAnimatedStyle}>
                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNextQuestion}
                  >
                    <Text style={styles.nextButtonText}>Next Question</Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <Animated.View
                  style={styles.resultContainer}
                  entering={FadeIn.delay(300).duration(400)}
                >
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreTitle}>Your Score</Text>
                    <Text style={styles.scoreValue}>
                      {score} / {quiz.questions.length}
                    </Text>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          {
                            width: `${(score / quiz.questions.length) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.scorePercentage}>
                      {Math.round((score / quiz.questions.length) * 100)}%
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.restartButton}
                    onPress={handleRestartQuiz}
                  >
                    <MaterialCommunityIcons
                      name="refresh"
                      size={20}
                      color="white"
                    />
                    <Text style={styles.restartButtonText}>Restart Quiz</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e6f0ff",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 10,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  questionIcon: {
    marginBottom: 16,
    alignSelf: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6f0ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1976d2",
  },
  correctOption: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
  },
  incorrectOption: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
  },
  correctOptionText: {
    color: "#4caf50",
    fontWeight: "600",
  },
  incorrectOptionText: {
    color: "#f44336",
    fontWeight: "600",
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fffde7",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  explanationIcon: {
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: "#5d4037",
    marginBottom: 20,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
  resultContainer: {
    alignItems: "center",
  },
  scoreContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 16,
  },
  scoreBar: {
    height: 10,
    backgroundColor: "#e6e6e6",
    borderRadius: 5,
    width: "100%",
    marginBottom: 8,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  scorePercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3498db",
  },
  restartButton: {
    backgroundColor: "#2c3e50",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restartButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
  },
});
