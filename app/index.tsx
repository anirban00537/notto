import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import AuthComponent from "./auth";
import FolderModals from "../components/FolderModals";
import NoteCard from "../components/NoteCard";
import NoteOptionsModal from "../components/NoteOptionsModal";
import YouTubeModal from "../components/YouTubeModal";
import { useUser } from "./context/UserContext";
import { Folder } from "../lib/types/folder";
import LoadingScreen from "../components/LoadingScreen";
import { HomeHeader } from "../components/HomeHeader";
import { useNotes } from "../hooks/useNotes";
import { useFolders } from "../hooks/useFolders";

export default function Note() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const noteOptionsBottomSheetRef = useRef<BottomSheet>(null);
  const folderDrawerRef = useRef<any>(null);
  const createFolderModalRef = useRef<any>(null);
  const youtubeBottomSheetRef = useRef<BottomSheet>(null);

  // YouTube modal state
  const [youtubeModalVisible, setYoutubeModalVisible] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  const { folders, newFolderName, setNewFolderName, handleCreateFolder } =
    useFolders();

  const { data: notes = [], isLoading: isNotesLoading } = useNotes(
    user?.uid,
    selectedFolderId
  );

  const onOpenNoteOptions = () => {
    noteOptionsBottomSheetRef.current?.snapToIndex(1);
  };

  const openFolderDrawer = () => {
    folderDrawerRef.current?.expand();
  };

  // YouTube note creation logic
  const { mutate: createNote, isLoading: isCreatingNote } = require("../lib/services").createNote ? require("@tanstack/react-query").useMutation({
    mutationFn: require("../lib/services").createNote,
    onSuccess: (newNote: any) => {
      noteOptionsBottomSheetRef.current?.close();
      setYoutubeModalVisible(false);
      setYoutubeUrl("");
      setYoutubeLoading(false);
      // Invalidate notes query if needed
      // router.push(`/note/${newNote?.data?.id}`);
    },
    onError: () => {
      setYoutubeLoading(false);
      alert("Failed to create note. Please try again.");
    },
  }) : { mutate: () => {}, isLoading: false };

  const handleAddYouTube = () => {
    noteOptionsBottomSheetRef.current?.close();
    setYoutubeUrl("");
    setYoutubeModalVisible(true);
  };

  const handleCloseYouTubeModal = () => {
    setYoutubeModalVisible(false);
    setYoutubeUrl("");
    setYoutubeLoading(false);
  };

  const handleSubmitYouTube = () => {
    if (!youtubeUrl || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl)) {
      alert("Please enter a valid YouTube URL.");
      return;
    }
    setYoutubeLoading(true);
    createNote({ noteType: "YOUTUBE", youtubeUrl });
  };


  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthComponent />;
  }

  const selectedFolder =
    selectedFolderId === "all"
      ? { id: "all", name: "All Notes" }
      : folders.find((folder: Folder) => folder.id === selectedFolderId) || {
          id: "all",
          name: "All Notes",
        };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f7ff" />

        <HomeHeader
          selectedFolder={selectedFolder}
          onFolderPress={openFolderDrawer}
        />

        {notes.length > 0 && <Text style={styles.sectionTitle}>Notes</Text>}

        {isNotesLoading ? (
          <View style={styles.emptyStateContainer}>
            <LoadingScreen />
          </View>
        ) : !notes.length ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={48}
                color="#2c3e50"
              />
            </View>
            <Text style={styles.emptyStateTitle}>No Notes Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first note by tapping the button below
            </Text>
          </View>
        ) : (
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
                <View>
                  <NoteCard
                    id={item.id}
                    title={item.title}
                    content={item.content}
                    createdAt={
                      new Date(
                        item.createdAt?._seconds
                          ? item.createdAt._seconds * 1000
                          : item.createdAt
                      )
                    }
                    icon={item.icon || item.noteType}
                    onPress={() => router.push(`/note/${item.id}`)}
                  />
                </View>
              </Link>
            )}
          />
        )}

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

      <NoteOptionsModal
        bottomSheetRef={noteOptionsBottomSheetRef}
        onAddYouTube={handleAddYouTube}
      />

      <YouTubeModal
        bottomSheetRef={youtubeBottomSheetRef}
        visible={youtubeModalVisible}
        loading={youtubeLoading}
        url={youtubeUrl}
        onUrlChange={setYoutubeUrl}
        onClose={handleCloseYouTubeModal}
        onSubmit={handleSubmitYouTube}
      />

      <FolderModals
        bottomSheetRef={folderDrawerRef}
        bottomSheetCreateRef={createFolderModalRef}
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        userId={user.uid}
        folders={folders}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#f0f7ff",
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 16,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
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
    color: "#111",
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
    borderTopColor: "#e6f0ff",
    backgroundColor: "#f0f7ff",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c3e50",
    borderRadius: 12,
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
    borderRadius: 12,
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
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
