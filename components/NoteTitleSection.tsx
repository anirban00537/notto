import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Typography } from "../constants/Typography";

interface NoteTitleSectionProps {
  title: string;
  lastModified: string;
  showFullTitle?: boolean;
  insideCard?: boolean;
}

const NoteTitleSection: React.FC<NoteTitleSectionProps> = ({
  title,
  lastModified,
  showFullTitle = false,
  insideCard = false,
}) => {
  return (
    <View style={[styles.container, insideCard && styles.insideCard]}>
      <Text
        style={Typography.noteTitle}
        numberOfLines={showFullTitle ? undefined : 1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <Text style={Typography.caption}>{lastModified}</Text>
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
