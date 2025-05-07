import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

// Font family constants
export const FONTS = {
  regular: "Inter",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
};

// Typography styles
export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontFamily: FONTS.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: "#000000",
  },
  h2: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.5,
    color: "#000000",
  },
  h3: {
    fontFamily: FONTS.medium,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.25,
    color: "#000000",
  },
  h4: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.25,
    color: "#000000",
  },

  // Body text
  body1: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  body2: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#000000",
  },
  body3: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#000000",
  },

  // Special styles
  noteTitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.25,
    color: "#000000",
  },
  noteContent: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: "#000000",
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: "#000000",
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: "#666666",
  },
});

export default Typography;
