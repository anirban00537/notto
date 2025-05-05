import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";

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
      <TouchableOpacity
        style={[styles.actionButton, styles.noteToolsButton]}
        onPress={onNoteToolsPress}
      >
        <MaterialCommunityIcons
          name="creation"
          size={18}
          color="#fff"
          style={{ transform: [{ rotate: "90deg" }], marginRight: 8 }}
        />
        <Text style={[Typography.buttonText, styles.noteToolsButtonText]}>
          Note Tools
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.editNoteButton]}
        onPress={onEditNotePress}
      >
        <MaterialCommunityIcons
          name="pencil-outline"
          size={18}
          color="#333"
          style={{ marginRight: 8 }}
        />
        <Text style={[Typography.buttonText, styles.editNoteButtonText]}>
          Edit Note
        </Text>
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
    backgroundColor: "#000000",
  },
  editNoteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6f0ff",
  },
  noteToolsButtonText: {
    color: "#fff",
  },
  editNoteButtonText: {
    color: "#000000",
  },
});
