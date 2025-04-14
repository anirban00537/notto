import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Folder } from "../lib/services/folderService";

type IconName = "format-list-bulleted" | "folder-outline" | "plus" | "check" | "folder" | "view-list";

export interface FolderItem extends Folder {
  icon: IconName;
}

interface FolderListItemProps {
  item: FolderItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const FolderListItem: React.FC<FolderListItemProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.folderListItem,
        isSelected && styles.selectedFolderListItem,
      ]}
      onPress={() => onSelect(item.id)}
      activeOpacity={0.6}
      hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={22}
        color={isSelected ? "#111" : "#555"}
      />
      <Text
        style={[
          styles.folderListItemText,
          isSelected && styles.selectedFolderListItemText,
        ]}
      >
        {item.name}
      </Text>
      {isSelected && (
        <MaterialCommunityIcons
          name="check"
          size={22}
          color="#111"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  folderListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  selectedFolderListItem: {
    backgroundColor: "#f5f5f5",
  },
  folderListItemText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 16,
    flex: 1,
  },
  selectedFolderListItemText: {
    color: "#111",
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default FolderListItem;
