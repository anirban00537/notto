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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
    color: "#2c3e50",
  },
  optionButton: {
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 14,
    color: "#2c3e50",
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
  explanationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  resultContainer: {
    alignItems: "center",
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
  },
  restartButton: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  restartButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
