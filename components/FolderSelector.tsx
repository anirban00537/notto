import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Folder } from "../lib/types/folder";

interface FolderSelectorProps {
  selectedFolder: Folder | { id: string; name: string };
  onFolderPress: () => void;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolder,
  onFolderPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.folderButton}
      onPress={onFolderPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="folder-outline" size={22} color="#555" />
      <Text style={styles.folderName}>{selectedFolder.name}</Text>
      <MaterialCommunityIcons name="chevron-down" size={20} color="#555" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    marginLeft: 10,
  },
});
