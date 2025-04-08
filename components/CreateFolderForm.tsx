import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
} from "react-native";
import { Folder, createFolder } from "../lib/services/folderService";

interface CreateFolderFormProps {
  userId: string;
  onFolderCreated: (folder: Folder) => void;
  onClose: () => void;
}

const CreateFolderForm: React.FC<CreateFolderFormProps> = ({
  userId,
  onFolderCreated,
  onClose,
}) => {
  const [newFolderName, setNewFolderName] = useState<string>("");

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === "") return;

    const newFolder: Omit<Folder, "id"> = {
      name: newFolderName.trim(),
      userId,
    };

    const createdFolder = await createFolder(newFolder);
    onFolderCreated(createdFolder);
    setNewFolderName("");
    Keyboard.dismiss();
    onClose();
  };

  return (
    <View style={styles.createFolderModalContent}>
      <TextInput
        style={styles.createFolderInput}
        placeholder="Enter folder name"
        value={newFolderName}
        onChangeText={setNewFolderName}
        autoFocus={true}
        onSubmitEditing={handleCreateFolder}
      />
      <TouchableOpacity
        style={styles.saveFolderButton}
        onPress={handleCreateFolder}
      >
        <Text style={styles.saveFolderButtonText}>Save Folder</Text>
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
