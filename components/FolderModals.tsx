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
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
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
  const snapPoints = React.useMemo(() => [1, 280], []);

  useEffect(() => {
    setNewName(folder?.name || "");
  }, [folder]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={folder ? 1 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onClose={() => {
        setIsRenaming(false);
        onClose();
      }}
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalHeaderText}>Folder Options</Text>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              style={styles.blackButton}
              onPress={() => onRename(newName)}
              disabled={isLoading || !newName.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.blackButtonText}>Save</Text>
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
      </BottomSheetScrollView>
    </BottomSheet>
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

  // Main folder list snap points
  const folderSnapPoints = React.useMemo(() => [1, 520], []);

  // Create folder snap points
  const createFolderSnapPoints = React.useMemo(() => [1, 330], []);

  // Use the useFolders hook to get folders directly
  const { folders: hookFolders, refetchFolders } = useFolders();

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
      activeOpacity={0.8}
    >
      <View style={styles.createFolderIconContainer}>
        <MaterialCommunityIcons name="folder-plus" size={20} color="#fff" />
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
      <BottomSheet
        ref={bottomSheetRef}
        index={isFolderSheetOpen ? 1 : -1}
        snapPoints={folderSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={() => setIsFolderSheetOpen(false)}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={1}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Select Folder</Text>
        </View>
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderHeader()}
          {loadingFolders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Loading folders...</Text>
            </View>
          ) : folderItems.length > 1 ? ( // Check if we have more than just "All Notes"
            <View style={styles.folderListContainer}>
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
          ) : (
            <Text style={styles.emptyMessage}>
              No folders found. Create a new folder to get started.
            </Text>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetCreateRef}
        index={isCreateSheetOpen ? 1 : -1}
        snapPoints={createFolderSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={() => setIsCreateSheetOpen(false)}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            appearsOnIndex={1}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Create New Folder</Text>
        </View>
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CreateFolderForm
            userId={userId}
            onClose={handleCreateFolderClose}
            onSuccess={handleCreateFolderSuccess}
            autoFocus={isCreateSheetOpen}
          />
        </BottomSheetScrollView>
      </BottomSheet>

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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: "#C7C7CC",
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  drawerHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 200,
    paddingBottom: 30,
  },
  folderListContainer: {
    marginHorizontal: 16,
  },
  createFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#000000",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createFolderIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  createFolderButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.1,
    textAlign: "center",
    
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#F2F2F7",
  },
  modalHeader: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 0.1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    minHeight: 150,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginVertical: 5,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  modalOptionIcon: {
    marginRight: 16,
    width: 24,
    height: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  renameInput: {
    fontSize: 16,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderColor: "#EFEFEF",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    color: "#333",
  },
  blackButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  blackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  saveFolderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyMessage: {
    textAlign: "center",
    padding: 20,
    color: "#8E8E93",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#000",
    fontSize: 16,
  },
});

export default FolderModals;
