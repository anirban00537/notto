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
        <Text style={styles.noteToolsButtonText}>Note Tools</Text>
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
        <Text style={styles.editNoteButtonText}>Edit Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
  },
  noteToolsButton: {
    backgroundColor: "#111",
    marginRight: 8,
  },
  noteToolsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  editNoteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginLeft: 8,
  },
  editNoteButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
});
