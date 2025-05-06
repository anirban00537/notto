import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Typography } from "../constants/Typography";
import { format } from "date-fns";

interface NoteTitleSectionProps {
  title: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | string | number;
  showFullTitle?: boolean;
  insideCard?: boolean;
}

const NoteTitleSection: React.FC<NoteTitleSectionProps> = ({
  title,
  createdAt,
  showFullTitle = false,
  insideCard = false,
}) => {
  // Convert createdAt to a valid Date object
  const getValidDate = () => {
    try {
      if (createdAt instanceof Date) {
        return createdAt;
      } else if (
        typeof createdAt === "object" &&
        createdAt !== null &&
        "seconds" in createdAt
      ) {
        // Handle Firestore timestamp
        return new Date(createdAt.seconds * 1000);
      } else if (
        typeof createdAt === "string" ||
        typeof createdAt === "number"
      ) {
        return new Date(createdAt);
      } else {
        return new Date(); // Fallback to current date
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date(); // Fallback to current date
    }
  };

  const dateToDisplay = getValidDate();

  return (
    <View style={[styles.container, insideCard && styles.insideCard]}>
      <Text
        style={Typography.noteTitle}
        numberOfLines={showFullTitle ? undefined : 1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <Text style={Typography.caption}>
        {format(dateToDisplay, "MMM d, yyyy · h:mm a")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 0,
  },
  insideCard: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
});

export default NoteTitleSection;
