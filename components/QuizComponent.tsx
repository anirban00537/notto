import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

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

  return (
    <View style={styles.container}>
      <View style={styles.quizCard}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </Text>

          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
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
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>

              {!isLastQuestion ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.nextButtonText}>Next Question</Text>
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
                    <Text style={styles.restartButtonText}>Restart Quiz</Text>
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
    backgroundColor: "#f7f9fc",
  },
  quizCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#34495e",
    textAlign: "center",
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 16,
    color: "#34495e",
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: "#f7f9fc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  optionText: {
    fontSize: 16,
    color: "#34495e",
  },
  selectedOption: {
    backgroundColor: "#e0f7fa",
    borderColor: "#00bcd4",
    borderWidth: 2,
  },
  correctOption: {
    backgroundColor: "#e8f5e9",
    borderColor: "#4caf50",
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 2,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6c757d",
  },
  explanationText: {
    fontSize: 15,
    color: "#495057",
    marginBottom: 12,
    lineHeight: 21,
  },
  nextButton: {
    backgroundColor: "#34495e",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  nextButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#34495e",
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: "#34495e",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  restartButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
