import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Typography, FONTS } from "../constants/Typography";

interface NoteContentProps {
  content: string;
}

const markdownStyles = StyleSheet.create({
  body: {
    color: "#2D3748",
    fontSize: 16,
    lineHeight: 26,
    fontFamily: FONTS.regular,
    letterSpacing: 0.1,
  },
  paragraph: {
    marginVertical: 12,
    fontFamily: FONTS.regular,
    letterSpacing: 0.1,
  },
  heading1: {
    fontSize: 24,
    marginTop: 28,
    marginBottom: 14,
    fontFamily: FONTS.medium,
    letterSpacing: -0.5,
    color: "#1A202C",
  },
  heading2: {
    fontSize: 20,
    marginTop: 24,
    marginBottom: 12,
    fontFamily: FONTS.medium,
    letterSpacing: -0.25,
    color: "#1A202C",
  },
  heading3: {
    fontSize: 18,
    marginTop: 22,
    marginBottom: 10,
    fontFamily: FONTS.medium,
    color: "#1A202C",
  },
  heading4: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
    fontFamily: FONTS.medium,
    color: "#1A202C",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#E2E8F0",
    paddingLeft: 16,
    paddingVertical: 8,
    marginVertical: 16,
    marginHorizontal: 4,
    backgroundColor: "#F7FAFC",
    borderRadius: 4,
    fontFamily: FONTS.regular,
    fontStyle: "italic",
  },
  code_block: {
    backgroundColor: "#F7FAFC",
    padding: 16,
    paddingHorizontal: 18,
    marginVertical: 16,
    marginHorizontal: 4,
    borderRadius: 6,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  list_item: {
    marginVertical: 6,
    paddingLeft: 4,
    fontFamily: FONTS.regular,
  },
  bullet_list: {
    marginVertical: 12,
  },
  ordered_list: {
    marginVertical: 12,
  },
  link: {
    color: "#3182CE",
    textDecorationLine: "none",
    fontFamily: FONTS.regular,
  },
  em: {
    fontStyle: "italic",
    fontFamily: FONTS.regular,
  },
  strong: {
    fontFamily: FONTS.medium,
    color: "#1A202C",
  },
  hr: {
    backgroundColor: "#E2E8F0",
    height: 1,
    marginVertical: 24,
  },
  table: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  tableHeaderCell: {
    padding: 8,
    backgroundColor: "#F7FAFC",
    fontFamily: FONTS.medium,
  },
  tableCell: {
    padding: 8,
    fontFamily: FONTS.regular,
  },
  image: {
    marginVertical: 16,
    borderRadius: 8,
  },
});

export default function NoteContent({ content }: NoteContentProps) {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h3, styles.sectionTitle]}>Note</Text>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
});
