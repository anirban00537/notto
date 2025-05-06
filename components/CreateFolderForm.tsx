import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder } from "../lib/services/folderService";

interface CreateFolderFormProps {
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

const CreateFolderForm: React.FC<CreateFolderFormProps> = ({
  userId,
  onClose,
  onSuccess,
  autoFocus = false,
}) => {
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: (newFolder: { name: string; userId: string }) => {
      console.log("Creating folder:", newFolder);
      return createFolder(newFolder);
    },
    onSuccess: (response) => {
      console.log("Folder created successfully:", response);

      // Invalidate and refetch folders to ensure list is updated
      queryClient.invalidateQueries({ queryKey: ["folders"] });

      // Clear form and dismiss keyboard
      setNewFolderName("");
      Keyboard.dismiss();

      // Close create form modal
      onClose();

      // Wait a moment then call onSuccess to open the folder list modal
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 300);
    },
    onError: (error: any) => {
      console.error("Error in createFolderMutation:", error);
      setError(error.message || "Failed to create folder");
      Alert.alert(
        "Error Creating Folder",
        error.message || "Failed to create folder. Please try again."
      );
    },
  });

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === "") return;
    setError(null);

    try {
      console.log("Attempting to create folder:", {
        name: newFolderName.trim(),
        userId,
      });

      await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        userId,
      });
    } catch (error: any) {
      console.error("Error in handleCreateFolder:", error);
      setError(error.message || "Failed to create folder");
    }
  };

  return (
    <View style={styles.createFolderModalContent}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.createFolderInput}
        placeholder="Enter folder name"
        value={newFolderName}
        onChangeText={setNewFolderName}
        autoFocus={autoFocus}
        onSubmitEditing={handleCreateFolder}
      />
      <TouchableOpacity
        style={[
          styles.saveFolderButton,
          newFolderName.trim() === "" && styles.disabledButton,
        ]}
        onPress={handleCreateFolder}
        disabled={createFolderMutation.isPending || newFolderName.trim() === ""}
      >
        {createFolderMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveFolderButtonText}>Save Folder</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  createFolderModalContent: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
    backgroundColor: "#ffffff",
  },
  createFolderInput: {
    fontSize: 16,
    padding: 16,
    borderColor: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    color: "#333",
  },
  saveFolderButton: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveFolderButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#666",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 15,
    fontSize: 14,
  },
});

export default CreateFolderForm;
