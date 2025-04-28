import React, { RefObject, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Animated, Alert, TextInput, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CommonBottomSheet from "./CommonBottomSheet";
import { Folder } from "../lib/types/folder";
import FolderListItem, { FolderItem } from "./FolderListItem";
import CreateFolderForm from "./CreateFolderForm";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateFolder, deleteFolder } from "../lib/services/folderService";

interface FolderModalsProps {
  bottomSheetRef: RefObject<any>;
  bottomSheetCreateRef: RefObject<any>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  userId: string;
  folders: Folder[];
}

const ModalOptionButton: React.FC<{ onPress: () => void; disabled?: boolean; icon: React.ReactNode; label: string; }> = ({ onPress, disabled, icon, label }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };
  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={({ pressed }) => [styles.modalOption, pressed && styles.pressed]}
        onPress={onPress}
        disabled={disabled}
        onPressIn={animateIn}
        onPressOut={animateOut}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon}
        <Text style={styles.modalOptionText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const FolderOptionsModal: React.FC<{
  bottomSheetRef: RefObject<any>;
  folder: Folder | null;
  onClose: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  isRenaming: boolean;
  setIsRenaming: (v: boolean) => void;
  isLoading: boolean;
}> = ({ bottomSheetRef, folder, onClose, onRename, onDelete, isRenaming, setIsRenaming, isLoading }) => {
  const [newName, setNewName] = useState(folder?.name || "");
  useEffect(() => { setNewName(folder?.name || ""); }, [folder]);
  return (
    <CommonBottomSheet
      ref={bottomSheetRef}
      visible={!!folder}
      snapPoints={[1, 260]}
      backgroundStyle={{ backgroundColor: '#fff' }}
      handleIndicatorStyle={{ backgroundColor: '#ccc' }}
      onClose={() => { setIsRenaming(false); onClose(); }}
    >
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderText}>Folder Options</Text>
        </View>
        <View style={styles.modalContent}>
          {isRenaming ? (
            <View style={{ marginBottom: 16 }}>
              <TextInput
                style={styles.renameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new folder name"
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveFolderButton}
                onPress={() => onRename(newName)}
                disabled={isLoading || !newName.trim()}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveFolderButtonText}>Save</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ModalOptionButton
                onPress={() => setIsRenaming(true)}
                disabled={isLoading}
                icon={<MaterialCommunityIcons name="pencil-outline" size={24} color="#1976d2" style={styles.modalOptionIcon} />}
                label="Rename Folder"
              />
              <ModalOptionButton
                onPress={onDelete}
                disabled={isLoading}
                icon={<MaterialCommunityIcons name="trash-can-outline" size={24} color="#d32f2f" style={styles.modalOptionIcon} />}
                label="Delete Folder"
              />
            </>
          )}
        </View>
      </CommonBottomSheet>
  );
};

const FolderModals: React.FC<FolderModalsProps> = ({
  bottomSheetRef,
  bottomSheetCreateRef,
  selectedFolderId,
  onFolderSelect,
  userId,
  folders = [],
}) => {
  // Track if create folder sheet is open
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false);
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

  // Folder options modal state
  const folderOptionsSheetRef = useRef<any>(null);
  const [optionsFolder, setOptionsFolder] = useState<Folder | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const updateFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateFolder(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsRenaming(false);
      setIsLoading(false);
      folderOptionsSheetRef.current?.close();
    },
    onError: () => {
      setIsLoading(false);
      Alert.alert("Error", "Failed to rename folder. Try again.");
    },
  });
  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsLoading(false);
      folderOptionsSheetRef.current?.close();
    },
    onError: () => {
      setIsLoading(false);
      Alert.alert("Error", "Failed to delete folder. Try again.");
    },
  });

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
      <CommonBottomSheet
        ref={bottomSheetRef}
        visible={isFolderSheetOpen}
        snapPoints={[1, 320]}
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        onClose={() => setIsFolderSheetOpen(false)}
      >
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
                onOptions={() => {
                  if (item.id !== "all") {
                    setOptionsFolder(item as Folder);
                    setIsRenaming(false);
                    folderOptionsSheetRef.current?.expand();
                  }
                }}
              />
            ))} 
          </View>
      </CommonBottomSheet>

      <CommonBottomSheet
        ref={bottomSheetCreateRef}
        visible={isCreateSheetOpen}
        snapPoints={[1, 320]}
        backgroundStyle={{ backgroundColor: '#fff' }}
        handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        onClose={() => setIsCreateSheetOpen(false)}
      >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Create New Folder</Text>
          </View>
          <CreateFolderForm userId={userId} onClose={handleCreateFolderClose} autoFocus={isCreateSheetOpen} />
      </CommonBottomSheet>
      <FolderOptionsModal
        bottomSheetRef={folderOptionsSheetRef}
        folder={optionsFolder}
        onClose={() => setOptionsFolder(null)}
        isRenaming={isRenaming}
        setIsRenaming={setIsRenaming}
        isLoading={isLoading || updateFolderMutation.isPending || deleteFolderMutation.isPending}
        onRename={(newName: string) => {
          if (!optionsFolder || !newName.trim()) return;
          setIsLoading(true);
          updateFolderMutation.mutate({ id: optionsFolder.id, name: newName.trim() });
        }}
        onDelete={() => {
          if (!optionsFolder) return;
          Alert.alert(
            "Delete Folder",
            `Are you sure you want to delete "${optionsFolder.name}"?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                  setIsLoading(true);
                  deleteFolderMutation.mutate(optionsFolder.id);
                },
              },
            ]
          );
        }}
      />
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
  // ModalOptionButton styles
  pressed: {
    opacity: 0.7,
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  renameInput: {
    fontSize: 16,
    padding: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveFolderButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 10,
  },
  saveFolderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FolderModals;
