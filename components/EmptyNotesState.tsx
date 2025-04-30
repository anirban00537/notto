import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface EmptyNotesStateProps {
  onCreateNote?: () => void;
}

const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ onCreateNote }) => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <LinearGradient
          colors={["rgba(240, 247, 255, 0.9)", "rgba(214, 234, 255, 0.9)"]}
          style={styles.gradientBackground}
        />
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={48}
            color="#2c3e50"
          />
        </View>
        <View style={[styles.smallIconCircle, styles.smallIcon1]}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#4096FE"
          />
        </View>
        <View style={[styles.smallIconCircle, styles.smallIcon2]}>
          <MaterialCommunityIcons
            name="image-outline"
            size={20}
            color="#FF9500"
          />
        </View>
        <View style={[styles.smallIconCircle, styles.smallIcon3]}>
          <MaterialCommunityIcons
            name="microphone-outline"
            size={20}
            color="#34C759"
          />
        </View>
      </View>

      <Text style={styles.title}>No Notes Yet</Text>
      <Text style={styles.description}>
        Create your first note by tapping the button below to get started with
        your ideas, thoughts, and inspirations.
      </Text>

      {/* {onCreateNote && (
        <TouchableOpacity style={styles.createButton} onPress={onCreateNote}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create New Note</Text>
        </TouchableOpacity>
      )} */}
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
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  gradientBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    opacity: 0.8,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  smallIconCircle: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallIcon1: {
    top: 30,
    right: 24,
  },
  smallIcon2: {
    bottom: 40,
    right: 40,
  },
  smallIcon3: {
    bottom: 40,
    left: 40,
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c3e50",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default EmptyNotesState;
