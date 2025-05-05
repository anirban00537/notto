import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Typography, FONTS } from "../constants/Typography";

interface TranscriptContentProps {
  transcript: string;
}

export default function TranscriptContent({
  transcript,
}: TranscriptContentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={Typography.h3}>Transcript</Text>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[Typography.body1, styles.transcriptText]}>
            {transcript || "No transcript available"}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  contentSection: {
    marginBottom: 24,
  },
  scrollContainer: {
    marginTop: 12,
  },
  transcriptText: {
    color: "#2D3748",
  },
});
