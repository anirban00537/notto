import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Folder } from "../lib/types/folder";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

interface FolderSelectorProps {
  selectedFolder?: Folder | { id: string; name: string };
  onFolderPress: () => void;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolder = { id: "all", name: "All Notes" },
  onFolderPress,
}) => {
  // Safety check to ensure a valid selectedFolder is provided
  const folderName = selectedFolder?.name || "All Notes";
  const iconName =
    selectedFolder?.id === "all" ? "view-list" : "folder-outline";

  return (
    <TouchableOpacity
      style={styles.folderButton}
      onPress={onFolderPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={iconName} size={18} color="#555" />
      <Text style={[Typography.body2, styles.folderName]}>{folderName}</Text>
      <MaterialCommunityIcons name="chevron-down" size={16} color="#555" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: Colors.light.deepBackground,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  folderName: {
    flex: 1,
    color: "#000000",
    marginLeft: 8,
  },
});
