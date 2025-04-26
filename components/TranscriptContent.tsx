import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TranscriptContentProps {
  transcript: string;
}

export default function TranscriptContent({
  transcript,
}: TranscriptContentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Transcript</Text>
        <Text style={styles.transcriptText}>
          {transcript || "No transcript available"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
