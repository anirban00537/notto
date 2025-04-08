import React, { RefObject, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import { Folder, getFolders } from "../lib/services/folderService";
import FolderListItem, { FolderItem } from "./FolderListItem";
import CreateFolderForm from "./CreateFolderForm";

interface FolderModalsProps {
  listModalRef: RefObject<Modalize>;
  createModalRef: RefObject<Modalize>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  userId: string;
}

const FolderModals: React.FC<FolderModalsProps> = ({
  listModalRef,
  createModalRef,
  selectedFolderId,
  onFolderSelect,
  userId,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    if (userId) {
      loadFolders();
    }
  }, [userId]);

  const loadFolders = async () => {
    const userFolders = await getFolders(userId);
    setFolders(userFolders);
  };

  const folderItems: FolderItem[] = [
    { id: "all", name: "All Notes", icon: "format-list-bulleted", userId },
    ...folders.map((folder) => ({
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

  const handleFolderCreated = (folder: Folder) => {
    setFolders([...folders, folder]);
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
        <CreateFolderForm
          userId={userId}
          onFolderCreated={handleFolderCreated}
          onClose={() => createModalRef.current?.close()}
        />
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
