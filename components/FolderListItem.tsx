import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Folder } from "../lib/types/folder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolder } from "../lib/services/folderService";

type IconName = "format-list-bulleted" | "folder-outline" | "plus" | "check" | "folder" | "view-list";

export interface FolderItem extends Omit<Folder, 'id'> {
  id: string;
  icon: IconName;
}

interface FolderListItemProps {
  item: FolderItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onOptions?: () => void;
}

const FolderListItem: React.FC<FolderListItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  onOptions,
}) => {
  const queryClient = useQueryClient();
  
  const deleteFolderMutation = useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      if (onDelete) onDelete(item.id);
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Folder",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFolderMutation.mutate(item.id),
        },
      ]
    );
  };

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
        <>
          <MaterialCommunityIcons
            name="check"
            size={22}
            color="#111"
            style={styles.checkIcon}
          />
          {item.id !== "all" && (
            <>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color="#d32f2f"
                />
              </TouchableOpacity>
              {onOptions && (
                <TouchableOpacity
                  onPress={onOptions}
                  style={styles.optionsButton}
                  hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={22}
                    color="#888"
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </>
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
    backgroundColor: "#f0f7ff",
  },
  selectedFolderListItem: {
    backgroundColor: "#e6f0ff",
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
  deleteButton: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 8,
  },
  optionsButton: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 8,
  },
});

export default FolderListItem;
