import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ActionButtonsProps {
  onNoteToolsPress: () => void;
  onEditNotePress: () => void;
}

export default function ActionButtons({
  onNoteToolsPress,
  onEditNotePress,
}: ActionButtonsProps) {
  return (
    <View style={styles.actionButtonsContainer}>
      <View style={styles.cancelButtonContainer}>
        <TouchableOpacity onPress={onNoteToolsPress}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.submitButton]}
        onPress={onEditNotePress}
      >
        <MaterialCommunityIcons
          name="check"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  noteToolsButton: {
    backgroundColor: "#2c3e50",
  },
  submitButton: {
    backgroundColor: "#2c3e50",
  },
  noteToolsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButtonContainer: {
    position: "absolute",
    right: 16,
    top: 12,
  },
  cancelButtonText: {
    color: "#2c3e50",
    fontSize: 15,
    fontWeight: "600",
  },
});
