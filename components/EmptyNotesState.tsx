import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "../constants/Colors";

interface EmptyNotesStateProps {
  onCreateNote?: () => void;
}

const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ onCreateNote }) => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={44}
            color={Colors.light.tint}
          />
        </View>
      </View>

      <Text style={styles.title}>No Notes Yet</Text>
      <Text style={styles.description}>
        Create your first note by tapping the button below to get started with
        your ideas, thoughts, and inspirations.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: 20,
    backgroundColor: Colors.light.background,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    marginBottom: 24,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.tintBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.medium,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.light.secondaryText,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
});

export default EmptyNotesState;
