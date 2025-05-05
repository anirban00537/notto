import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";

interface QuizCardProps {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdAt: Date;
  onPress: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  id,
  question = "No question provided",
  options = [],
  correctAnswer = "",
  createdAt,
  onPress,
}) => {
  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };

  return (
    <TouchableOpacity style={styles.quizCard} onPress={onPress}>
      <View style={styles.quizContent}>
        <Text style={[Typography.body1, styles.quizQuestion]}>{question}</Text>
        <View style={styles.bottomContent}>
          <Text style={[Typography.caption, styles.quizDate]}>
            {formatDate(createdAt)}
          </Text>
          <View style={styles.optionsCount}>
            <Text style={[Typography.caption, styles.optionsCountText]}>
              {options.length} options
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quizCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6f0ff",
  },
  quizContent: {
    flex: 1,
  },
  quizQuestion: {
    color: "#111",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizDate: {
    color: "#999",
  },
  optionsCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "#2c3e50",
  },
  optionsCountText: {
    color: "#fff",
  },
});

export default QuizCard;
