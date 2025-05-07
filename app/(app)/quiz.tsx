import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";
import { useNoteDetail } from "@/hooks/useNoteDetail";

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

export default function QuizScreen() {
  const router = useRouter();
  const { noteId, title } = useLocalSearchParams<{
    noteId: string;
    title: string;
  }>();

  const { note, loading, isGenerating, handleGenerateMaterials } =
    useNoteDetail(noteId);

  const handleBackPress = () => {
    router.back();
  };

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null
  );
  const [showExplanation, setShowExplanation] = React.useState(false);
  const [score, setScore] = React.useState(0);

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

  const quiz =
    note?.quizzes && note.quizzes.length > 0
      ? { ...note.quizzes[0], title: note.title || "Quiz" }
      : null;

  const handleAnswerSelect = (answer: string) => {
    if (!quiz) return;

    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === quiz.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
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

  const renderProgressBar = () => {
    if (!quiz) return null;

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>
    );
  };

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

        <Text style={styles.headerTitle}>Quiz</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <LoadingScreen />
          </View>
        ) : quiz ? (
          <View style={styles.quizContainer}>
            <View style={styles.quizCard}>
              {renderProgressBar()}

              <Text style={[Typography.h2, styles.quizTitle]}>
                {quiz.title}
              </Text>

              <View style={styles.questionContainer}>
                <Text style={[Typography.h4, styles.questionText]}>
                  {quiz.questions[currentQuestionIndex].question}
                </Text>

                {quiz.questions[currentQuestionIndex].options.map(
                  (option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect =
                      option ===
                      quiz.questions[currentQuestionIndex].correctAnswer;
                    const isIncorrect =
                      showExplanation && isSelected && !isCorrect;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOption,
                          showExplanation && isCorrect && styles.correctOption,
                          isIncorrect && styles.incorrectOption,
                        ]}
                        onPress={() =>
                          !showExplanation && handleAnswerSelect(option)
                        }
                        disabled={showExplanation}
                        activeOpacity={0.7}
                      >
                        {showExplanation && isCorrect && (
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={20}
                            color="#4caf50"
                            style={styles.optionIcon}
                          />
                        )}
                        {isIncorrect && (
                          <MaterialCommunityIcons
                            name="close-circle-outline"
                            size={20}
                            color="#f44336"
                            style={styles.optionIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.selectedOptionText,
                            showExplanation &&
                              isCorrect &&
                              styles.correctOptionText,
                            isIncorrect && styles.incorrectOptionText,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}

                {showExplanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={[Typography.h4, styles.explanationLabel]}>
                      Explanation
                    </Text>
                    <Text style={[Typography.body1, styles.explanationText]}>
                      {quiz.questions[currentQuestionIndex].explanation}
                    </Text>

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNextQuestion}
                      >
                        <Text
                          style={[Typography.buttonText, styles.buttonText]}
                        >
                          Next Question
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.resultContainer}>
                        <Text style={[Typography.h3, styles.resultText]}>
                          You scored {score} out of {quiz.questions.length}
                        </Text>
                        <TouchableOpacity
                          style={styles.restartButton}
                          onPress={handleRestartQuiz}
                        >
                          <Text
                            style={[Typography.buttonText, styles.buttonText]}
                          >
                            Restart Quiz
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              iconName="clipboard-edit-outline"
              message="No quiz available yet."
              description="Generate quiz questions based on your note content to help you study more effectively."
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
  quizContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
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
  quizCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 24,
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
    fontFamily: FONTS.regular,
  },
  quizTitle: {
    marginBottom: 24,
    color: "#111",
    textAlign: "center",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    marginBottom: 20,
    color: "#111",
    lineHeight: 26,
  },
  optionButton: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontFamily: FONTS.regular,
  },
  selectedOption: {
    backgroundColor: "#f8f8f8",
    borderColor: "#ddd",
  },
  selectedOptionText: {
    fontFamily: FONTS.medium,
  },
  correctOption: {
    backgroundColor: "#f5fbf5",
    borderColor: "#c8e6c9",
  },
  correctOptionText: {
    color: "#2e7d32",
    fontFamily: FONTS.medium,
  },
  incorrectOption: {
    backgroundColor: "#fff5f5",
    borderColor: "#ffcdd2",
  },
  incorrectOptionText: {
    color: "#c62828",
    fontFamily: FONTS.medium,
  },
  explanationContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  explanationLabel: {
    marginBottom: 8,
    color: "#333",
  },
  explanationText: {
    marginBottom: 20,
    color: "#333",
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.light.background,
  },
  resultContainer: {
    alignItems: "center",
  },
  resultText: {
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
});
