import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (answer === currentQuestion.correctAnswer) {
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
    <View style={styles.container}>
      <View style={styles.quizCard}>
        {renderProgressBar()}

        <Text style={styles.quizTitle}>{quiz.title}</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const isIncorrect = showExplanation && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  showExplanation && isCorrect && styles.correctOption,
                  isIncorrect && styles.incorrectOption,
                ]}
                onPress={() => !showExplanation && handleAnswerSelect(option)}
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
                    showExplanation && isCorrect && styles.correctOptionText,
                    isIncorrect && styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>

              {!isLastQuestion ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.buttonText}>Next Question</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultText}>
                    You scored {score} out of {quiz.questions.length}
                  </Text>
                  <TouchableOpacity
                    style={styles.restartButton}
                    onPress={handleRestartQuiz}
                  >
                    <Text style={styles.buttonText}>Restart Quiz</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  quizCard: {
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 0,
    marginBottom: 20,
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
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 24,
    color: "#111",
    textAlign: "center",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#111",
    lineHeight: 26,
    fontWeight: "500",
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
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
  },
  selectedOption: {
    backgroundColor: "#f8f8f8",
    borderColor: "#ddd",
  },
  selectedOptionText: {
    fontWeight: "500",
  },
  correctOption: {
    backgroundColor: "#f5fbf5",
    borderColor: "#c8e6c9",
  },
  correctOptionText: {
    color: "#2e7d32",
  },
  incorrectOption: {
    backgroundColor: "#fff5f5",
    borderColor: "#ffcdd2",
  },
  incorrectOptionText: {
    color: "#c62828",
  },
  explanationContainer: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
  },
  resultContainer: {
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "500",
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
