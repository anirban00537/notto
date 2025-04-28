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
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder } from "../lib/services/folderService";

interface CreateFolderFormProps {
  userId: string;
  onClose: () => void;
  autoFocus?: boolean;
}

const CreateFolderForm: React.FC<CreateFolderFormProps> = ({
  userId,
  onClose,
  autoFocus = false,
}) => {
  const [newFolderName, setNewFolderName] = useState<string>("");
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: (newFolder: { name: string; userId: string }) =>
      createFolder(newFolder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setNewFolderName("");
      Keyboard.dismiss();
      onClose();
      queryClient.refetchQueries({ queryKey: ["folders"] });
    },
  });

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === "") return;

    try {
      await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        userId,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <View style={styles.createFolderModalContent}>
      <TextInput
        style={styles.createFolderInput}
        placeholder="Enter folder name"
        value={newFolderName}
        onChangeText={setNewFolderName}
        autoFocus={autoFocus}
        onSubmitEditing={handleCreateFolder}
      />
      <TouchableOpacity
        style={styles.saveFolderButton}
        onPress={handleCreateFolder}
        disabled={createFolderMutation.isPending}
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
  },
  createFolderInput: {
    fontSize: 16,
    padding: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveFolderButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
  },
  saveFolderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateFolderForm;
