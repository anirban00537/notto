/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color constants based on the landing page design
 * Using teal as primary color with minimal shadows
 */

// Main teal colors from landing page
const tealPrimary = "#0D9488"; // teal-600
const tealLight = "#2DD4BF"; // teal-400
const tealLighter = "#F0FDFA"; // teal-50

export const Colors = {
  light: {
    text: "#111827", // gray-900
    secondaryText: "#4B5563", // gray-600
    tertiaryText: "#9CA3AF", // gray-400
    background: "#F5F5F5",
    deepBackground: "#F9F9F9",
    tint: tealPrimary,
    tintLight: tealLight,
    tintBackground: tealLighter,
    border: "#E5E7EB", // gray-200
    icon: "#6B7280", // gray-500
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tealPrimary,
    // Specific UI element colors
    cardBackground: "#F9F9F9",
    deleteButton: "#F87171", // red-400 (softer than pure red)
    recordButton: "#111827", // gray-900 (softer black)
    recordIconColor: "#F87171", // red-400 (for microphone icon)
    disabledBackground: "#F3F4F6", // gray-100
  },
  dark: {
    text: "#F9FAFB", // gray-50
    secondaryText: "#D1D5DB", // gray-300
    tertiaryText: "#9CA3AF", // gray-400
    background: "#1F2937", // gray-800
    tint: tealLight,
    tintLight: tealPrimary,
    tintBackground: "rgba(45, 212, 191, 0.1)", // teal-400 with opacity
    border: "#374151", // gray-700
    borderLight: "#4B5563", // gray-600
    icon: "#9CA3AF", // gray-400
    tabIconDefault: "#6B7280",
    tabIconSelected: tealLight,
    // Specific UI element colors
    cardBackground: "#374151", // gray-700
    deleteButton: "#F87171", // red-400
    recordButton: "#F9FAFB", // gray-50
    recordIconColor: "#F87171", // red-400 (for microphone icon)
    disabledBackground: "#4B5563", // gray-600
  },
};
