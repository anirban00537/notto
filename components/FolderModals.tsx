import React, { RefObject, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Folder } from "../lib/services/folderService";
import FolderListItem, { FolderItem } from "./FolderListItem";
import CreateFolderForm from "./CreateFolderForm";
import { useQueryClient } from "@tanstack/react-query";

interface FolderModalsProps {
  listModalRef: RefObject<Modalize>;
  createModalRef: RefObject<Modalize>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  userId: string;
  folders: Folder[];
}

const FolderModals: React.FC<FolderModalsProps> = ({
  listModalRef,
  createModalRef,
  selectedFolderId,
  onFolderSelect,
  userId,
  folders = [],
}) => {
  const queryClient = useQueryClient();

  // Ensure folders is always an array
  const folderArray = Array.isArray(folders) ? folders : [];

  const folderItems: FolderItem[] = [
    { id: "all", name: "All Notes", icon: "format-list-bulleted", userId },
    ...folderArray.map((folder) => ({
      ...folder,
      icon: "folder-outline" as const,
    })),
  ];

  const renderHeader = () => (
    <TouchableOpacity
      style={styles.createFolderButton}
      onPress={() => {
        listModalRef.current?.close();
        setTimeout(() => {
          createModalRef.current?.open();
        }, 150);
      }}
    >
      <MaterialCommunityIcons name="plus" size={22} color="#555" />
      <Text style={styles.createFolderButtonText}>Create New Folder</Text>
    </TouchableOpacity>
  );

  const handleFolderSelect = (id: string) => {
    onFolderSelect(id);
    listModalRef.current?.close();
  };

  const handleCreateFolderClose = () => {
    // Refetch folders when the create folder modal closes
    queryClient.refetchQueries({ queryKey: ["folders"] });
    createModalRef.current?.close();
  };

  return (
    <>
      <Modalize
        ref={listModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Folder</Text>
          </View>
        }
        onOpen={() => {
          // Refetch folders when the list modal opens
          queryClient.refetchQueries({ queryKey: ["folders"] });
        }}
        flatListProps={{
          data: folderItems,
          keyExtractor: (item) => item.id,
          ListHeaderComponent: renderHeader,
          renderItem: ({ item }) => (
            <FolderListItem
              item={item}
              isSelected={selectedFolderId === item.id}
              onSelect={handleFolderSelect}
            />
          ),
          style: styles.listDrawerContent,
          scrollEnabled: true,
          nestedScrollEnabled: true,
        }}
      />

      <Modalize
        ref={createModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Create New Folder</Text>
          </View>
        }
      >
        <CreateFolderForm userId={userId} onClose={handleCreateFolderClose} />
      </Modalize>
    </>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  listDrawerContent: {
    paddingVertical: 12,
  },
  createFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  createFolderButtonText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 16,
  },
});

export default FolderModals;
