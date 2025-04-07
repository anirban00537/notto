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
  const folderModalRef = useRef<Modalize>(null);
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

  const handleAddFolderPress = () => {
    folderModalRef.current?.open();
  };

  const handleSaveFolder = () => {
    if (newFolderName.trim() === "") {
      return;
    }
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    folderModalRef.current?.close();
    Keyboard.dismiss();
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

  const filteredNotes = notes;

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

        <View style={styles.foldersScrollViewContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={styles.folderItemContainer}
              onPress={handleAddFolderPress}
            >
              <View style={styles.addFolderIconCircle}>
                <MaterialCommunityIcons name="plus" size={28} color="#555" />
              </View>
              <Text style={styles.folderName}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.folderItemContainer}
              onPress={() => setSelectedFolderId("all")}
            >
              <View
                style={[
                  styles.folderIconCircle,
                  selectedFolderId === "all" && styles.folderIconCircleSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={26}
                  color={selectedFolderId === "all" ? "#fff" : "#555"}
                />
              </View>
              <Text
                style={[
                  styles.folderName,
                  selectedFolderId === "all" && styles.folderNameSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={styles.folderItemContainer}
                onPress={() => setSelectedFolderId(folder.id)}
              >
                <View
                  style={[
                    styles.folderIconCircle,
                    selectedFolderId === folder.id &&
                      styles.folderIconCircleSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="folder-outline"
                    size={26}
                    color={selectedFolderId === folder.id ? "#fff" : "#555"}
                  />
                </View>
                <Text
                  style={[
                    styles.folderName,
                    selectedFolderId === folder.id && styles.folderNameSelected,
                  ]}
                >
                  {folder.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>

        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard}>
              {renderNoteIcon(item.icon)}
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.notePreview} numberOfLines={1}>
                  {item.content}
                </Text>
              </View>
              <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
            </TouchableOpacity>
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
        ref={folderModalRef}
        adjustToContentHeight
        HeaderComponent={
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Create New Folder</Text>
          </View>
        }
      >
        <View style={styles.folderModalContent}>
          <TextInput
            style={styles.folderInput}
            placeholder="Enter folder name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus={true}
            onSubmitEditing={handleSaveFolder}
          />
          <TouchableOpacity
            style={styles.saveFolderButton}
            onPress={handleSaveFolder}
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
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    letterSpacing: -0.5,
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  foldersScrollViewContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  folderItemContainer: {
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 60,
  },
  folderIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  folderIconCircleSelected: {
    backgroundColor: "#111",
  },
  addFolderIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  folderName: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  folderNameSelected: {
    color: "#111",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#555",
    marginLeft: 24,
    marginBottom: 12,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 16,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF5EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  notePreview: {
    fontSize: 14,
    color: "#777",
    lineHeight: 21,
  },
  noteDate: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "48%",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
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
  folderModalContent: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    paddingBottom: Platform.OS === "ios" ? 40 : 30,
  },
  folderInput: {
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
