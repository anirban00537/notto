import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
            size={48}
            color="#2c3e50"
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
    backgroundColor: "#ffffff",
  },
  illustrationContainer: {
    width: 160,
    height: 160,
    marginBottom: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#7d8a98",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
});

export default EmptyNotesState;
