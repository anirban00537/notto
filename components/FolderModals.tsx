import React, { RefObject } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";

interface Folder {
  id: string;
  name: string;
}

// Define a type for the icons we're using
type IconName = "format-list-bulleted" | "folder-outline" | "plus" | "check";

// Extended interface for folder items with icon
interface FolderItem extends Folder {
  icon: IconName;
}

interface FolderModalsProps {
  listModalRef: RefObject<Modalize>;
  createModalRef: RefObject<Modalize>;
  folders: Folder[];
  selectedFolderId: string;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  onFolderSelect: (folderId: string) => void;
  onOpenCreateModal: () => void; // Callback to trigger opening the create modal
  onCreateFolder: () => void; // Callback to trigger folder creation logic
}

const FolderModals: React.FC<FolderModalsProps> = ({
  listModalRef,
  createModalRef,
  folders,
  selectedFolderId,
  newFolderName,
  setNewFolderName,
  onFolderSelect,
  onOpenCreateModal,
  onCreateFolder,
}) => {
  // Combine "All Notes" with user folders for the list
  const folderItems: FolderItem[] = [
    { id: "all", name: "All Notes", icon: "format-list-bulleted" },
    ...folders.map((folder) => ({
      ...folder,
      icon: "folder-outline" as IconName,
    })),
  ];

  return (
    <>
      {/* Folder Selection Drawer (List) */}
      <Modalize
        ref={listModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Folder</Text>
          </View>
        }
      >
        <View style={styles.listDrawerContent}>
          {/* List View for Folder Selection */}
          <FlatList
            data={folderItems}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <TouchableOpacity
                style={styles.createFolderButton}
                onPress={onOpenCreateModal}
              >
                <MaterialCommunityIcons name="plus" size={22} color="#555" />
                <Text style={styles.createFolderButtonText}>
                  Create New Folder
                </Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.folderListItem,
                  selectedFolderId === item.id && styles.selectedFolderListItem,
                ]}
                onPress={() => {
                  onFolderSelect(item.id);
                  listModalRef.current?.close();
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={selectedFolderId === item.id ? "#111" : "#555"}
                />
                <Text
                  style={[
                    styles.folderListItemText,
                    selectedFolderId === item.id &&
                      styles.selectedFolderListItemText,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedFolderId === item.id && (
                  <MaterialCommunityIcons
                    name="check"
                    size={22}
                    color="#111"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modalize>

      {/* Separate Drawer/Modal for Creating Folders */}
      <Modalize
        ref={createModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Create New Folder</Text>
          </View>
        }
      >
        <View style={styles.createFolderModalContent}>
          <TextInput
            style={styles.createFolderInput}
            placeholder="Enter folder name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus={true}
            onSubmitEditing={onCreateFolder} // Use callback prop
          />
          <TouchableOpacity
            style={styles.saveFolderButton}
            onPress={onCreateFolder} // Use callback prop
          >
            <Text style={styles.saveFolderButtonText}>Save Folder</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </>
  );
};

// Styles copied and adapted from index.tsx relevant to modals
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
  folderListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  selectedFolderListItem: {
    backgroundColor: "#f5f5f5",
  },
  folderListItemText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 16,
    flex: 1,
  },
  selectedFolderListItemText: {
    color: "#111",
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
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

export default FolderModals;
