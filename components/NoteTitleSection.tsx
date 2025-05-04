import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface NoteTitleSectionProps {
  title: string;
  lastModified: string;
  showFullTitle?: boolean;
  insideCard?: boolean;
}

export default function NoteTitleSection({
  title,
  lastModified,
  showFullTitle = true,
  insideCard = false,
}: NoteTitleSectionProps) {
  const formattedTitle = title.trim() || "Untitled Note";

  return (
    <View
      style={[
        styles.titleContainer,
        insideCard && styles.titleContainerInsideCard,
      ]}
    >
      <View style={styles.titleTextContainer}>
        <Text
          style={styles.noteTitle}
          numberOfLines={showFullTitle ? undefined : 1}
          ellipsizeMode={showFullTitle ? undefined : "tail"}
        >
          {formattedTitle}
        </Text>
        <Text style={styles.lastModified}>Last modified: {lastModified}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 0,
    paddingVertical: 16,
    marginBottom: 0,
    width: "100%",
  },
  titleContainerInsideCard: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  titleTextContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 0,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
    flexWrap: "wrap",
    paddingRight: 0,
  },
  lastModified: {
    fontSize: 14,
    color: "#888",
  },
});
