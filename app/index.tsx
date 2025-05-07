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
import { useRouter } from "expo-router";
import AuthComponent from "./auth";
import FolderModals from "../components/FolderModals";
import NoteOptionsModal from "../components/NoteOptionsModal";
import YouTubeModal from "../components/YouTubeModal";
import EmptyNotesState from "../components/EmptyNotesState";
import { useUser } from "./context/UserContext";
import { Folder } from "../lib/types/folder";
import NotesSkeleton from "../components/NotesSkeleton";
import { HomeHeader } from "../components/HomeHeader";
import { FolderSelector } from "../components/FolderSelector";
import { useNotes } from "../hooks/useNotes";
import { useFolders } from "../hooks/useFolders";
import { Typography, FONTS } from "../constants/Typography";
import SwipeableNoteCard from "../components/SwipeableNoteCard";
import { Colors } from "../constants/Colors";

export default function Note() {
  const { user, loading } = useUser();
  console.log(
    "User state:",
    user ? "User exists" : "No user",
    "Loading:",
    loading
  );

  // Return auth component if no user - add special debug logging
  if (!user) {
    console.log("No user detected, showing AuthComponent");
    return <AuthComponent />;
  }

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [isFolderChanging, setIsFolderChanging] = useState(false);
  const noteOptionsBottomSheetRef = useRef<BottomSheet>(null);
  const folderDrawerRef = useRef<any>(null);
  const createFolderModalRef = useRef<any>(null);
  const youtubeBottomSheetRef = useRef<BottomSheet>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [listAnimation] = useState(new Animated.Value(0));
  const [isAnimationReady, setIsAnimationReady] = useState(false);

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

  // Pre-animate list when notes are loaded
  useEffect(() => {
    if (notes.length > 0 && !isNotesLoading) {
      // Reset animation when folder changes
      if (isFolderChanging) {
        listAnimation.setValue(0);
      }

      // Start animation with slight delay to ensure rendering is complete
      setTimeout(() => {
        Animated.spring(listAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start(() => {
          setIsAnimationReady(true);
        });
      }, 50);
    }
  }, [notes.length, isNotesLoading, isFolderChanging]);

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

  // Handle folder selection with skeleton loading
  const handleFolderSelect = (folderId: string) => {
    if (folderId !== selectedFolderId) {
      setIsFolderChanging(true);
      setIsAnimationReady(false);
      setSelectedFolderId(folderId);
    }
  };

  // Reset folder changing state when notes finish loading
  useEffect(() => {
    if (!isNotesLoading && isFolderChanging) {
      // Add a small delay to ensure notes are fully loaded before animation starts
      setTimeout(() => {
        setIsFolderChanging(false);
      }, 100);
    }
  }, [isNotesLoading]);

  // Show skeleton for initial loading or during folder changes
  const showSkeleton =
    ((loading || isNotesLoading) && isInitialLoad) || isFolderChanging;

  // Keep showing skeleton until animation is ready to start
  const shouldShowSkeleton =
    showSkeleton || (notes.length > 0 && !isAnimationReady);

  // Ensure selectedFolder is defined even during skeleton loading
  const selectedFolder =
    selectedFolderId === "all"
      ? { id: "all", name: "All Notes" }
      : folders.find((folder: Folder) => folder.id === selectedFolderId) || {
          id: "all",
          name: "All Notes",
        };

  // If showing skeleton, return the skeleton loader
  if (shouldShowSkeleton) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.light.background}
          translucent={false}
        />
        <SafeAreaView style={styles.container}>
          <HomeHeader />
          <FolderSelector
            selectedFolder={selectedFolder}
            onFolderPress={openFolderDrawer}
          />
          <NotesSkeleton />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

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
          createdAt={item.createdAt}
          icon={item.noteType}
          onPress={() => {
            console.log(`Navigating to note/${item.id}`);
            router.push(`/note/${item.id}`);
          }}
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
        <ActivityIndicator size="small" color={Colors.light.text} />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
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
                refreshing={
                  refreshing ||
                  (isNotesLoading && !isInitialLoad && !isFolderChanging)
                }
                onRefresh={onRefresh}
                tintColor={Colors.light.tint}
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
              color={Colors.light.recordIconColor}
            />
            <Text
              style={[
                Typography.buttonText,
                styles.actionButtonText,
                { color: Colors.light.background },
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
              color={Colors.light.background}
            />
            <Text
              style={[
                Typography.buttonText,
                styles.actionButtonText,
                { color: Colors.light.background },
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
        onFolderSelect={handleFolderSelect}
        userId={user.uid}
        folders={folders}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.background,
  },
  folderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginRight: 16,
  },
  folderName: {
    flex: 1,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.text,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 16,
  },
  proText: {
    color: Colors.light.background,
    marginLeft: 6,
    fontFamily: FONTS.medium,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
  },
  sectionTitle: {
    color: Colors.light.text,
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
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.recordButton,
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
    backgroundColor: Colors.light.tint,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 6,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    elevation: 0,
  },
  actionButtonText: {
    marginLeft: 8,
    color: Colors.light.text,
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
