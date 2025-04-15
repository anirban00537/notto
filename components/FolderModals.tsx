import React, { RefObject, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Folder } from "../lib/types/folder";
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
    { id: "all" as const, name: "All Notes", icon: "view-list" as const, userId },
    ...folderArray.map((folder) => ({
      ...folder,
      icon: "folder" as const,
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
      activeOpacity={0.6}
      hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
    >
      <MaterialCommunityIcons name="folder-plus" size={22} color="#fff" />
      <Text style={styles.createFolderButtonText}>Create New Folder</Text>
    </TouchableOpacity>
  );

  const handleFolderSelect = (id: string) => {
    onFolderSelect(id);
    listModalRef.current?.close();
  };

  const handleFolderDelete = (id: string) => {
    // Refetch folders after deletion
    queryClient.refetchQueries({ queryKey: ["folders"] });
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
              onDelete={handleFolderDelete}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f0f7ff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  listDrawerContent: {
    paddingVertical: 8,
    backgroundColor: "#f0f7ff",
  },
  createFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#2c3e50",
    backgroundColor: "#2c3e50",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    transitionProperty: 'transform',
    transitionDuration: '150ms',
  },
  createFolderButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default FolderModals;
