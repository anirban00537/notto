import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Folder } from "../lib/types/folder";
import { Typography, FONTS } from "../constants/Typography";

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
      <MaterialCommunityIcons name="folder-outline" size={18} color="#555" />
      <Text style={[Typography.body2, styles.folderName]}>
        {selectedFolder.name}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={16} color="#555" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  folderName: {
    flex: 1,
    color: "#000000",
    marginLeft: 8,
  },
});
