import React, { RefObject, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CommonBottomSheet from "./CommonBottomSheet";
import { Folder } from "../lib/types/folder";
import FolderListItem, { FolderItem } from "./FolderListItem";
import CreateFolderForm from "./CreateFolderForm";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  updateFolder,
  deleteFolder,
  getAllFolders,
} from "../lib/services/folderService";
import { getAllNotes } from "../lib/services/noteService";
import { useFolders } from "../hooks/useFolders";

interface FolderModalsProps {
  bottomSheetRef: RefObject<any>;
  bottomSheetCreateRef: RefObject<any>;
  selectedFolderId: string;
  onFolderSelect: (folderId: string) => void;
  userId: string;
  folders?: Folder[]; // Make folders optional since we'll fetch them directly too
}

const ModalOptionButton: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}> = ({ onPress, disabled, icon, label }) => {
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
}> = ({
  bottomSheetRef,
  folder,
  onClose,
  onRename,
  onDelete,
  isRenaming,
  setIsRenaming,
  isLoading,
}) => {
  const [newName, setNewName] = useState(folder?.name || "");
  useEffect(() => {
    setNewName(folder?.name || "");
  }, [folder]);
  return (
    <CommonBottomSheet
      ref={bottomSheetRef}
      visible={!!folder}
      snapPoints={[1, 260]}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onClose={() => {
        setIsRenaming(false);
        onClose();
      }}
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
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveFolderButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ModalOptionButton
              onPress={() => setIsRenaming(true)}
              disabled={isLoading}
              icon={
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color="#007AFF"
                  style={styles.modalOptionIcon}
                />
              }
              label="Rename Folder"
            />
            <ModalOptionButton
              onPress={onDelete}
              disabled={isLoading}
              icon={
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#FF3B30"
                  style={styles.modalOptionIcon}
                />
              }
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
  folders: propFolders = [],
}) => {
  // Track if create folder sheet is open
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false);
  const queryClient = useQueryClient();
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Use the useFolders hook to get folders directly
  const { folders: hookFolders, refetchFolders } = useFolders(userId);

  // Also add a direct query for more control
  const { data: foldersResponse, isLoading: isFoldersLoading } = useQuery({
    queryKey: ["folders", userId],
    queryFn: () => getAllFolders(userId),
    enabled: !!userId,
  });

  // Combine folders from props and from hooks, with priority to the newest data
  const combinedFolders = [
    ...(foldersResponse?.data || []),
    ...hookFolders,
    ...propFolders,
  ];

  // Remove duplicates by id
  const uniqueFolderMap = new Map();
  combinedFolders.forEach((folder) => {
    if (folder && folder.id) {
      uniqueFolderMap.set(folder.id, folder);
    }
  });

  // Create the final folders array with duplicates removed
  const folderArray = Array.from(uniqueFolderMap.values());

  // Update loading state
  useEffect(() => {
    setLoadingFolders(isFoldersLoading);
  }, [isFoldersLoading]);

  // Debug info
  console.log("Folder Modal Rendering with:", {
    propFoldersCount: propFolders.length,
    hookFoldersCount: hookFolders.length,
    apiResponseFoldersCount: foldersResponse?.data?.length || 0,
    combinedUniqueCount: folderArray.length,
    selectedFolderId,
    userId,
    isLoading: loadingFolders,
  });

  // Update sheet visibility when refs change
  useEffect(() => {
    if (bottomSheetRef?.current) {
      const handleSheetChanges = (index: number) => {
        setIsFolderSheetOpen(index > 0);

        // Refresh folders data when modal opens
        if (index > 0) {
          refetchFolders();
          queryClient.invalidateQueries({ queryKey: ["folders", userId] });
        }
      };

      // Add listener to bottomSheetRef if it has an onChange method
      if (bottomSheetRef.current.onChange) {
        bottomSheetRef.current.onChange(handleSheetChanges);
      }
    }

    if (bottomSheetCreateRef?.current) {
      const handleCreateSheetChanges = (index: number) => {
        setIsCreateSheetOpen(index > 0);
      };

      // Add listener to bottomSheetCreateRef if it has an onChange method
      if (bottomSheetCreateRef.current.onChange) {
        bottomSheetCreateRef.current.onChange(handleCreateSheetChanges);
      }
    }
  }, [
    bottomSheetRef,
    bottomSheetCreateRef,
    userId,
    refetchFolders,
    queryClient,
  ]);

  const folderItems: FolderItem[] = [
    {
      id: "all" as const,
      name: "All Notes",
      icon: "view-list" as const,
      userId,
    },
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
  const [error, setError] = useState<string | null>(null);

  // Mutations
  const updateFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateFolder(id, userId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsRenaming(false);
      setIsLoading(false);
      folderOptionsSheetRef.current?.close();
    },
    onError: (error) => {
      console.error("Failed to update folder:", error);
      setIsLoading(false);
      setError(`Failed to rename folder: ${error.message}`);
      Alert.alert("Error", `Failed to rename folder. ${error.message}`);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => deleteFolder(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setIsLoading(false);
      folderOptionsSheetRef.current?.close();
    },
    onError: (error) => {
      console.error("Failed to delete folder:", error);
      setIsLoading(false);
      setError(`Failed to delete folder: ${error.message}`);
      Alert.alert("Error", `Failed to delete folder. ${error.message}`);
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
      activeOpacity={0.7}
    >
      <View style={styles.createFolderIconContainer}>
        <MaterialCommunityIcons name="folder-plus" size={22} color="#fff" />
      </View>
      <Text style={styles.createFolderButtonText}>Create New Folder</Text>
    </TouchableOpacity>
  );

  const handleFolderSelect = (id: string) => {
    console.log("Selecting folder:", id);
    // Invalidate and refetch notes with new folderId
    queryClient.invalidateQueries({
      queryKey: ["notes"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["notes", { folderId: id === "all" ? undefined : id }],
      refetchType: "all",
    });

    // Call the original onFolderSelect
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

  const handleCreateFolderSuccess = () => {
    // Reopen the folder list modal after successful folder creation
    setTimeout(() => {
      bottomSheetRef.current?.expand();
    }, 300);
  };

  // If there's an error, display it
  if (error) {
    console.warn("Folder modal error:", error);
  }

  return (
    <>
      <CommonBottomSheet
        ref={bottomSheetRef}
        visible={isFolderSheetOpen}
        snapPoints={[1, 320]}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={() => setIsFolderSheetOpen(false)}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Select Folder</Text>
        </View>
        <View style={styles.listDrawerContent}>
          {renderHeader()}
          {loadingFolders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Loading folders...</Text>
            </View>
          ) : folderItems.length > 1 ? ( // Check if we have more than just "All Notes"
            folderItems.map((item) => (
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
            ))
          ) : (
            <Text style={styles.emptyMessage}>
              No folders found. Create a new folder to get started.
            </Text>
          )}
        </View>
      </CommonBottomSheet>

      <CommonBottomSheet
        ref={bottomSheetCreateRef}
        visible={isCreateSheetOpen}
        snapPoints={[1, 320]}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={() => setIsCreateSheetOpen(false)}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Create New Folder</Text>
        </View>
        <CreateFolderForm
          userId={userId}
          onClose={handleCreateFolderClose}
          onSuccess={handleCreateFolderSuccess}
          autoFocus={isCreateSheetOpen}
        />
      </CommonBottomSheet>
      <FolderOptionsModal
        bottomSheetRef={folderOptionsSheetRef}
        folder={optionsFolder}
        onClose={() => setOptionsFolder(null)}
        isRenaming={isRenaming}
        setIsRenaming={setIsRenaming}
        isLoading={
          isLoading ||
          updateFolderMutation.isPending ||
          deleteFolderMutation.isPending
        }
        onRename={(newName: string) => {
          if (!optionsFolder || !newName.trim()) return;
          setIsLoading(true);
          setError(null);
          updateFolderMutation.mutate({
            id: optionsFolder.id,
            name: newName.trim(),
          });
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
                  setError(null);
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
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: "#E0E0E0",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  listDrawerContent: {
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    flex: 1, // Make sure the content fills the available space
    minHeight: 200, // Ensure a minimum height
  },
  createFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createFolderIconContainer: {
    backgroundColor: "#000",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createFolderButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#f0f0f0",
  },
  modalHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    minHeight: 150, // Ensure minimum height for content
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginVertical: 6,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  modalOptionIcon: {
    marginRight: 16,
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 28,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  renameInput: {
    fontSize: 16,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderColor: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    color: "#333",
  },
  saveFolderButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveFolderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyMessage: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#000",
    fontSize: 16,
  },
});

export default FolderModals;
