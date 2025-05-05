import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Markdown from "react-native-markdown-display";
import { Typography, FONTS } from "../constants/Typography";

interface SummaryContentProps {
  content: string;
}

export default function SummaryContent({ content }: SummaryContentProps) {
  const { width } = useWindowDimensions();

  // Calculate appropriate font size based on screen width
  const baseFontSize = width > 375 ? 17 : 16;

  const markdownStyles = StyleSheet.create({
    // Overall document styling
    body: {
      color: "#2D3748",
      fontSize: baseFontSize,
      lineHeight: Math.round(baseFontSize * 1.6),
      fontFamily: FONTS.regular,
    },

    // Basic elements
    paragraph: {
      marginVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: baseFontSize,
      lineHeight: Math.round(baseFontSize * 1.6),
    },
    text: {
      fontFamily: FONTS.regular,
      lineHeight: Math.round(baseFontSize * 1.6),
    },

    // Headings with improved spacing and proportions
    heading1: {
      fontFamily: FONTS.semiBold,
      fontSize: Math.round(baseFontSize * 1.8),
      lineHeight: Math.round(baseFontSize * 2.2),
      letterSpacing: -0.5,
      marginTop: 28,
      marginBottom: 12,
      color: "#1A202C",
    },
    heading2: {
      fontFamily: FONTS.semiBold,
      fontSize: Math.round(baseFontSize * 1.5),
      lineHeight: Math.round(baseFontSize * 1.9),
      letterSpacing: -0.25,
      marginTop: 24,
      marginBottom: 10,
      color: "#1A202C",
    },
    heading3: {
      fontFamily: FONTS.medium,
      fontSize: Math.round(baseFontSize * 1.2),
      lineHeight: Math.round(baseFontSize * 1.6),
      marginTop: 20,
      marginBottom: 8,
      color: "#1A202C",
    },
    heading4: {
      fontFamily: FONTS.medium,
      fontSize: baseFontSize,
      lineHeight: Math.round(baseFontSize * 1.5),
      marginTop: 16,
      marginBottom: 8,
      color: "#1A202C",
    },

    // Block elements with enhanced styling
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: "#CBD5E0",
      paddingLeft: 16,
      paddingVertical: 4,
      marginVertical: 16,
      backgroundColor: "#F7FAFC",
      borderRadius: 4,
    },
    bullet_list: {
      marginVertical: 12,
    },
    ordered_list: {
      marginVertical: 12,
    },
    list_item: {
      marginVertical: 6,
      fontFamily: FONTS.regular,
      flexDirection: "row",
    },
    code_block: {
      backgroundColor: "#F7FAFC",
      padding: 14,
      borderRadius: 6,
      marginVertical: 12,
      fontFamily: "monospace",
      fontSize: baseFontSize - 1,
    },
    fence: {
      marginVertical: 12,
      padding: 14,
      backgroundColor: "#F7FAFC",
      borderRadius: 6,
    },

    // Inline elements
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
      fontWeight: "600",
      fontFamily: FONTS.medium,
      color: "#1A202C",
    },
    code_inline: {
      fontFamily: "monospace",
      backgroundColor: "#F7FAFC",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: baseFontSize - 1,
    },
    image: {
      marginVertical: 16,
      borderRadius: 8,
    },
    hr: {
      backgroundColor: "#E2E8F0",
      height: 1,
      marginVertical: 24,
    },
  });

  if (!content) {
    return (
      <View style={styles.container}>
        <Text style={Typography.h3}>Summary</Text>
        <Text style={styles.emptyText}>No summary available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={Typography.h3}>Summary</Text>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
    fontFamily: FONTS.regular,
  },
});
