import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

interface NoteContentProps {
  content: string;
}

const markdownStyles = StyleSheet.create({
  body: {
    color: "#24292e",
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginVertical: 8,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: "#ddd",
    paddingLeft: 16,
    marginVertical: 8,
  },
  code_block: {
    backgroundColor: "#f6f8fa",
    padding: 12,
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 4,
  },
});

export default function NoteContent({ content }: NoteContentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Note</Text>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
});
