import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Modalize } from "react-native-modalize";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Link } from "expo-router";
import AuthComponent from "./auth";
import FolderModals from "../components/FolderModals";
import NoteCard from "../components/NoteCard";
import {
  Note,
  Folder,
  getNotes,
  getFolders,
  createNote,
  createFolder,
} from "../lib/services";

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const noteOptionsModalRef = useRef<Modalize>(null);
  const folderDrawerRef = useRef<Modalize>(null);
  const createFolderModalRef = useRef<Modalize>(null);
  const [newFolderName, setNewFolderName] = useState<string>("");

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch folders
      getFolders(user.uid).then(setFolders);

      // Fetch notes
      getNotes(
        user.uid,
        selectedFolderId === "all" ? undefined : selectedFolderId
      ).then(setNotes);
    }
  }, [user, selectedFolderId]);

  const onOpenNoteOptions = () => {
    noteOptionsModalRef.current?.open();
  };

  const handleOptionPress = async (option: string) => {
    if (!user) return;

    const newNote: Omit<Note, "id"> = {
      title: `New ${option} Note`,
      content: "",
      createdAt: new Date(),
      icon: option.toLowerCase(),
      folderId: selectedFolderId === "all" ? undefined : selectedFolderId,
      userId: user.uid,
    };

    const createdNote = await createNote(newNote);
    setNotes([...notes, createdNote]);
    noteOptionsModalRef.current?.close();
  };

  const openFolderDrawer = () => {
    folderDrawerRef.current?.open();
  };

  const openCreateDrawer = () => {
    folderDrawerRef.current?.close();
    setTimeout(() => {
      createFolderModalRef.current?.open();
    }, 150);
  };

  const handleCreateFolder = async () => {
    if (!user || newFolderName.trim() === "") return;

    const newFolder: Omit<Folder, "id"> = {
      name: newFolderName.trim(),
      userId: user.uid,
    };

    const createdFolder = await createFolder(newFolder);
    setFolders([...folders, createdFolder]);
    setNewFolderName("");
    Keyboard.dismiss();
    createFolderModalRef.current?.close();
  };

  if (!user) {
    return <AuthComponent />;
  }

  const selectedFolder =
    selectedFolderId === "all"
      ? { id: "all", name: "All Notes" }
      : folders.find((folder) => folder.id === selectedFolderId) || {
          id: "all",
          name: "All Notes",
        };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notto</Text>
          <TouchableOpacity style={styles.proButton}>
            <MaterialCommunityIcons
              name="rocket-launch"
              size={16}
              color="#fff"
            />
            <Text style={styles.proText}>PRO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialCommunityIcons name="account" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.folderSelectorContainer}>
          <TouchableOpacity
            style={styles.folderButton}
            onPress={openFolderDrawer}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="folder-outline"
              size={22}
              color="#555"
            />
            <Text style={styles.folderName}>{selectedFolder.name}</Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Link
              href={{
                pathname: "/note/[id]",
                params: { id: item.id },
              }}
              asChild
            >
              <NoteCard
                id={item.id}
                title={item.title}
                content={item.content}
                createdAt={item.createdAt}
                icon={item.icon}
                onPress={() => {}}
              />
            </Link>
          )}
        />

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.recordButton} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name="record-circle"
              size={24}
              color="#f44336"
            />
            <Text style={styles.recordButtonText}>Record</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newNoteButton}
            activeOpacity={0.8}
            onPress={onOpenNoteOptions}
          >
            <MaterialCommunityIcons name="pencil-plus" size={24} color="#111" />
            <Text style={[styles.actionButtonText, { color: "#111" }]}>
              New Note
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modalize
        ref={noteOptionsModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Create New Note</Text>
          </View>
        }
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleOptionPress("PDF")}
          >
            <MaterialCommunityIcons
              name="file-pdf-box"
              size={24}
              color="#d32f2f"
              style={styles.modalOptionIcon}
            />
            <Text style={styles.modalOptionText}>Import PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleOptionPress("Audio")}
          >
            <MaterialCommunityIcons
              name="file-music-outline"
              size={24}
              color="#1976d2"
              style={styles.modalOptionIcon}
            />
            <Text style={styles.modalOptionText}>Import Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleOptionPress("YouTube")}
          >
            <MaterialCommunityIcons
              name="youtube"
              size={24}
              color="#ff0000"
              style={styles.modalOptionIcon}
            />
            <Text style={styles.modalOptionText}>Add YouTube Video</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      <FolderModals
        listModalRef={folderDrawerRef}
        createModalRef={createFolderModalRef}
        folders={folders}
        selectedFolderId={selectedFolderId}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onFolderSelect={setSelectedFolderId}
        onOpenCreateModal={openCreateDrawer}
        onCreateFolder={handleCreateFolder}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#f7f7f7",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    letterSpacing: -0.5,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 13,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#888",
    marginLeft: 24,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f7f7f7",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
    height: 50,
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
    height: 50,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recordButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
  folderSelectorContainer: {
    marginHorizontal: 24,
    marginVertical: 16,
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 10,
  },
});
