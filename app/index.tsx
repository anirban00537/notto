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

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  icon?: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [folders, setFolders] = useState<Folder[]>([
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" },
    { id: "ideas", name: "Ideas" },
    { id: "travel", name: "Travel" },
    { id: "recipes", name: "Recipes" },
  ]);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "pdf-1",
      title: "Annual Report Q4",
      content: "Review of the company performance, financial statements...",
      createdAt: new Date(2024, 11, 15),
      icon: "pdf",
      folderId: "work",
    },
    {
      id: "audio-1",
      title: "Meeting Notes - Project Alpha",
      content:
        "Discussion on project milestones, next steps, team assignments...",
      createdAt: new Date(2024, 11, 10),
      icon: "audio",
      folderId: "work",
    },
    {
      id: "youtube-1",
      title: "React Native Tutorial: Animations",
      content:
        "Learn how to implement engaging animations in React Native apps...",
      createdAt: new Date(2024, 11, 5),
      icon: "youtube",
      folderId: "ideas",
    },
  ]);
  const noteOptionsModalRef = useRef<Modalize>(null);
  const folderDrawerRef = useRef<Modalize>(null);
  const createFolderModalRef = useRef<Modalize>(null);
  const [newFolderName, setNewFolderName] = useState<string>("");

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber;
  }, []);

  const onOpenNoteOptions = () => {
    noteOptionsModalRef.current?.open();
  };

  const handleOptionPress = (option: string) => {
    console.log(`Selected option: ${option}`);
    noteOptionsModalRef.current?.close();
    // TODO: Implement logic for each option (PDF, Audio, YouTube)
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

  const handleCreateFolder = () => {
    if (newFolderName.trim() === "") return;
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    Keyboard.dismiss();
    createFolderModalRef.current?.close();
    console.log("New folder added:", newFolder);
    console.log("Current folders:", [...folders, newFolder]);
  };

  if (!user) {
    return <AuthComponent />;
  }

  const renderNoteIcon = (icon?: string) => {
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap | null = null;
    let iconColor: string | null = null;
    let backgroundColor: string | null = null;

    switch (icon) {
      case "pdf":
        iconName = "file-pdf-box";
        iconColor = "#D32F2F"; // Red
        backgroundColor = "#FFEBEE"; // Light Red
        break;
      case "audio":
        iconName = "file-music-outline";
        iconColor = "#1976D2"; // Blue
        backgroundColor = "#E3F2FD"; // Light Blue
        break;
      case "youtube":
        iconName = "youtube";
        iconColor = "#FF0000"; // Red (YouTube Brand)
        backgroundColor = "#FFEBEE"; // Light Red
        break;
      // Keep the palette case or remove if no longer needed
      case "palette":
        iconName = "palette";
        iconColor = "#EB6C3E";
        backgroundColor = "#FFF5EC";
        break;
    }

    if (iconName && iconColor && backgroundColor) {
      return (
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
        </View>
      );
    }
    return null;
  };

  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };

  const selectedFolder =
    selectedFolderId === "all"
      ? { id: "all", name: "All Notes" }
      : folders.find((folder) => folder.id === selectedFolderId) || {
          id: "all",
          name: "All Notes",
        };

  const filteredNotes =
    selectedFolderId === "all"
      ? notes
      : notes.filter((note) => note.folderId === selectedFolderId);

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
          data={filteredNotes}
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
              <TouchableOpacity style={styles.noteCard}>
                {renderNoteIcon(item.icon)}
                <View style={styles.noteContent}>
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.notePreview} numberOfLines={1}>
                    {item.content}
                  </Text>
                </View>
                <Text style={styles.noteDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </TouchableOpacity>
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

      <Modalize
        ref={folderDrawerRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Select Folder</Text>
          </View>
        }
      >
        <View style={styles.drawerContent}>
          <TouchableOpacity
            style={[
              styles.folderItem,
              selectedFolderId === "all" && styles.selectedFolderItem,
            ]}
            onPress={() => {
              setSelectedFolderId("all");
              folderDrawerRef.current?.close();
            }}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={22}
              color={selectedFolderId === "all" ? "#fff" : "#555"}
              style={styles.folderItemIcon}
            />
            <Text
              style={[
                styles.folderItemText,
                selectedFolderId === "all" && styles.selectedFolderText,
              ]}
            >
              All Notes
            </Text>
          </TouchableOpacity>

          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.folderItem,
                  selectedFolderId === item.id && styles.selectedFolderItem,
                ]}
                onPress={() => {
                  setSelectedFolderId(item.id);
                  folderDrawerRef.current?.close();
                }}
              >
                <MaterialCommunityIcons
                  name="folder-outline"
                  size={22}
                  color={selectedFolderId === item.id ? "#fff" : "#555"}
                  style={styles.folderItemIcon}
                />
                <Text
                  style={[
                    styles.folderItemText,
                    selectedFolderId === item.id && styles.selectedFolderText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.addFolderButton}
            onPress={openCreateDrawer}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#555" />
            <Text style={styles.addFolderText}>Create New Folder</Text>
          </TouchableOpacity>
        </View>
      </Modalize>

      <Modalize
        ref={createFolderModalRef}
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
            onSubmitEditing={handleCreateFolder}
          />
          <TouchableOpacity
            style={styles.saveFolderButton}
            onPress={handleCreateFolder}
          >
            <Text style={styles.saveFolderButtonText}>Save Folder</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
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
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF5EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noteContent: {
    flex: 1,
    paddingRight: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  notePreview: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: "#aaa",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
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
    backgroundColor: "#fafafa",
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
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  drawerContent: {
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 2,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  selectedFolderItem: {
    backgroundColor: "#555",
  },
  folderItemIcon: {
    marginRight: 16,
  },
  folderItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedFolderText: {
    color: "#fff",
  },
  addFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addFolderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginLeft: 8,
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
