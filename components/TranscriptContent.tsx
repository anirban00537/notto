import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

interface TranscriptContentProps {
  transcript: string;
}

export default function TranscriptContent({
  transcript,
}: TranscriptContentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentSection}>
        <Text style={styles.title}>Transcript</Text>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.transcriptText}>
            {transcript || "No transcript available"}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  
  },
  contentSection: {
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.25,
    color: Colors.light.text,
    marginBottom: 4,
  },
  scrollContainer: {
    marginTop: 12,
  },
  transcriptText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.secondaryText,
  },
});
