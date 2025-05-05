import React, { useState, useRef, useEffect } from "react";
import type { Note } from "../lib/types/note";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import AuthComponent from "./auth";
import FolderModals from "../components/FolderModals";
import NoteCard from "../components/NoteCard";
import NoteOptionsModal from "../components/NoteOptionsModal";
import YouTubeModal from "../components/YouTubeModal";
import EmptyNotesState from "../components/EmptyNotesState";
import { useUser } from "./context/UserContext";
import { Folder } from "../lib/types/folder";
import LoadingScreen from "../components/LoadingScreen";
import { HomeHeader } from "../components/HomeHeader";
import { FolderSelector } from "../components/FolderSelector";
import { useNotes } from "../hooks/useNotes";
import { useFolders } from "../hooks/useFolders";
import { Typography, FONTS } from "../constants/Typography";
import SwipeableNoteCard from "../components/SwipeableNoteCard";

export default function Note() {
  const { user, loading } = useUser();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const noteOptionsBottomSheetRef = useRef<BottomSheet>(null);
  const folderDrawerRef = useRef<any>(null);
  const createFolderModalRef = useRef<any>(null);
  const youtubeBottomSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [listAnimation] = useState(new Animated.Value(0));

  const { folders, newFolderName, setNewFolderName, handleCreateFolder } =
    useFolders();

  const {
    notes,
    isNotesLoading,
    youtubeModalVisible,
    youtubeUrl,
    youtubeLoading,
    youtubeSuccess,
    setYoutubeUrl,
    handleAddYouTube,
    handleCloseYouTubeModal,
    handleSubmitYouTube,
    refetchNotes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleDeleteNote,
    isDeletingNote,
  } = useNotes(user?.uid, selectedFolderId);

  useEffect(() => {
    if (notes.length > 0) {
      Animated.spring(listAnimation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [notes.length]);

  useEffect(() => {
    if (!loading && !isNotesLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isNotesLoading]);

  const onOpenNoteOptions = () => {
    noteOptionsBottomSheetRef.current?.snapToIndex(1);
  };

  const openFolderDrawer = () => {
    folderDrawerRef.current?.expand();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchNotes();
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Return loading screen only on initial load
  if ((loading || isNotesLoading) && isInitialLoad) {
    return <LoadingScreen />;
  }

  // Return auth component if no user
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

  const renderAnimatedItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const translateY = listAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [50 * (index + 1), 0],
    });

    const opacity = listAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    const scale = listAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 1.1, 1],
    });

    const onDelete = async () => {
      try {
        await handleDeleteNote(item.id);
      } catch (error) {
        console.error("Error deleting note:", error);
        Alert.alert("Error", "Failed to delete note");
      }
    };

    return (
      <Animated.View
        style={{
          transform: [{ translateY }, { scale }],
          opacity,
        }}
      >
        <SwipeableNoteCard
          id={item.id}
          title={item.title}
          createdAt={
            new Date(
              item.createdAt?._seconds
                ? item.createdAt._seconds * 1000
                : item.createdAt
            )
          }
          icon={item.noteType}
          onPress={() => router.push(`/note/${item.id}`)}
          onDelete={onDelete}
          isDeleting={isDeletingNote}
        />
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoadingContainer}>
        <ActivityIndicator size="small" color="#000000" />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <HomeHeader />
        <FolderSelector
          selectedFolder={selectedFolder}
          onFolderPress={openFolderDrawer}
        />

        {!notes.length ? (
          <EmptyNotesState onCreateNote={onOpenNoteOptions} />
        ) : (
          <FlatList
            data={notes}
            renderItem={renderAnimatedItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || (isNotesLoading && !isInitialLoad)}
                onRefresh={onRefresh}
                tintColor="#000000"
              />
            }
          />
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.recordButton}
            activeOpacity={0.8}
            onPress={() => router.push("/record")}
          >
            <MaterialCommunityIcons
              name="microphone-plus"
              size={24}
              color="#FFFFFF"
            />
            <Text
              style={[
                Typography.buttonText,
                styles.actionButtonText,
                { color: "#FFFFFF" },
              ]}
            >
              Record
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newNoteButton}
            activeOpacity={0.8}
            onPress={onOpenNoteOptions}
          >
            <MaterialCommunityIcons
              name="pencil-plus"
              size={24}
              color="#000000"
            />
            <Text
              style={[
                Typography.buttonText,
                styles.actionButtonText,
                { color: "#000000" },
              ]}
            >
              New Note
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <NoteOptionsModal
        bottomSheetRef={noteOptionsBottomSheetRef}
        onAddYouTube={handleAddYouTube}
        selectedFolderId={
          selectedFolderId === "all" ? undefined : selectedFolderId
        }
      />

      <YouTubeModal
        bottomSheetRef={youtubeBottomSheetRef}
        visible={youtubeModalVisible}
        loading={youtubeLoading}
        url={youtubeUrl}
        onUrlChange={setYoutubeUrl}
        onClose={handleCloseYouTubeModal}
        onSubmit={handleSubmitYouTube}
        isSuccess={youtubeSuccess}
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
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 16,
  },
  folderName: {
    flex: 1,
    color: "#111",
    marginLeft: 10,
    fontFamily: FONTS.medium,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  proButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 16,
  },
  proText: {
    color: "#fff",
    marginLeft: 6,
    fontFamily: FONTS.medium,
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
    color: "#111",
    marginLeft: 24,
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 6,
    height: 50,
    elevation: 0,
  },
  newNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 6,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    elevation: 0,
  },
  actionButtonText: {
    marginLeft: 8,
    color: "#000000",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  footerLoadingContainer: {
    paddingVertical: 20,
  },
});
