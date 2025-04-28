import React, { RefObject, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Folder } from "../lib/types/folder";
import FolderListItem, { FolderItem } from "./FolderListItem";
import CreateFolderForm from "./CreateFolderForm";
import { useQueryClient } from "@tanstack/react-query";

interface FolderModalsProps {
  bottomSheetRef: RefObject<BottomSheet>;
  bottomSheetCreateRef: RefObject<BottomSheet>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  userId: string;
  folders: Folder[];
}

const FolderModals: React.FC<FolderModalsProps> = ({
  bottomSheetRef,
  bottomSheetCreateRef,
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
        bottomSheetRef.current?.close();
        setTimeout(() => {
          bottomSheetCreateRef.current?.expand();
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
    bottomSheetRef.current?.close();
  };

  const handleFolderDelete = (id: string) => {
    // Refetch folders after deletion
    queryClient.refetchQueries({ queryKey: ["folders"] });
  };

  const handleCreateFolderClose = () => {
    // Refetch folders when the create folder modal closes
    queryClient.refetchQueries({ queryKey: ["folders"] });
    bottomSheetCreateRef.current?.close();
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={[1, 320]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        onChange={(index) => {
          // index 1 = open, index 0 = closed
          if (index === 1) {
            queryClient.refetchQueries({ queryKey: ["folders"] });
          }
        }}
      >
        <BottomSheetView>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Folder</Text>
          </View>
          <View style={styles.listDrawerContent}>
            {renderHeader()}
            {folderItems.map((item) => (
              <FolderListItem
                key={item.id}
                item={item}
                isSelected={selectedFolderId === item.id}
                onSelect={handleFolderSelect}
                onDelete={handleFolderDelete}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetCreateRef}
        index={-1}
        snapPoints={[1, 320]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}
      >
        <BottomSheetView>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Create New Folder</Text>
          </View>
          <CreateFolderForm userId={userId} onClose={handleCreateFolderClose} />
        </BottomSheetView>
      </BottomSheet>
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
