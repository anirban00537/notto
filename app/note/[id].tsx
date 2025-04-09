import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // Use this for better edge handling

// Import the new components
import NoteDetailHeader from "../../components/NoteDetailHeader";
import YouTubePreview from "../../components/YouTubePreview";
import ActionButtons from "../../components/ActionButtons";
import NoteTitleSection from "../../components/NoteTitleSection";
import ContentTabs from "../../components/ContentTabs";

// Mock data - replace with actual data fetching based on id
const getNoteDetails = (id: string) => {
  // In a real app, fetch data based on id
  return {
    id: "youtube-1",
    title: "Top UI Kits for Modern App Development",
    content: `In this video, the speaker emphasizes the critical importance of packaging and design in product success, drawing parallels between high-end perfume branding and software UI design. The speaker argues that the visual appeal and professionalism of your product's interface should not be an afterthought but a priority from the beginning. They highlight several UI kits that facilitate the creation of appealing products without starting from scratch, including:

1. Untitled UI - A comprehensive UI kit designed for Figma, featuring over 3,000 components and hundreds of templates.`,
    lastModified: "04-03-2025 - 23:41",
    icon: "palette", // Or derive from note type
    youtubeUrl:
      "https://www.youtube.com/watch?v=P0dhkRaOceI&ab_channel=ComicVerse",
    thumbnailUrl:
      "https://via.placeholder.com/400x200.png/000000/FFFFFF?text=Video+Thumbnail", // Placeholder thumbnail
  };
};

// Helper function to get icon details (optional, adjust as needed)
const getIconProps = (iconType?: string) => {
  switch (iconType) {
    case "pdf":
      return { name: "file-pdf-box", color: "#D32F2F", bgColor: "#FFEBEE" };
    case "audio":
      return {
        name: "file-music-outline",
        color: "#1976D2",
        bgColor: "#E3F2FD",
      };
    case "youtube":
      return { name: "youtube", color: "#FF0000", bgColor: "#FFEBEE" };
    case "palette":
      return { name: "palette", color: "#EB6C3E", bgColor: "#FFF5EC" };
    default:
      return { name: "note-text-outline", color: "#888", bgColor: "#f0f0f0" }; // Default icon
  }
};

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const note = getNoteDetails(id || "unknown");
  const scrollViewRef = useRef<ScrollView>(null);

  if (!note) {
    return <Text>Note not found</Text>;
  }

  const [activeContentTab, setActiveContentTab] = React.useState<
    "note" | "transcript" | "chat"
  >("note");

  const handleTabPress = (tab: "note" | "transcript" | "chat") => {
    setActiveContentTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const iconProps = getIconProps(note.icon);

  // Placeholder handlers for buttons
  const handleOptionsPress = () => console.log("Options pressed");
  const handleNoteToolsPress = () => console.log("Note Tools pressed");
  const handleEditNotePress = () => console.log("Edit Note pressed");

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      {/* Custom Header */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Use NoteDetailHeader component */}
      <NoteDetailHeader
        title={note.title}
        onBackPress={() => router.back()}
        onOptionsPress={handleOptionsPress}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ContentTabs activeTab={activeContentTab} onTabPress={handleTabPress} />

        {/* Note Tab Content */}
        {activeContentTab === "note" && (
          <>
            {/* Use YouTubePreview component with correct prop name */}
            <YouTubePreview directPlayableUrl={note.youtubeUrl} />

            {/* Use ActionButtons component */}
            <ActionButtons
              onNoteToolsPress={handleNoteToolsPress}
              onEditNotePress={handleEditNotePress}
            />

            {/* Use NoteTitleSection component */}
            <NoteTitleSection
              title={note.title}
              lastModified={note.lastModified}
              iconName={iconProps.name as any} // Cast needed if type complex
              iconColor={iconProps.color}
              iconBackgroundColor={iconProps.bgColor}
            />

            {/* Note Text Content (Only for Note Tab) */}
            <View style={styles.textContentPadding}>
              <Text style={styles.noteContentText}>{note.content}</Text>
            </View>
          </>
        )}

        {/* Transcript Tab Content */}
        {activeContentTab === "transcript" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              Transcript content would go here...
            </Text>
          </View>
        )}

        {/* Chat Tab Content */}
        {activeContentTab === "chat" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              Chat content would go here...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  textContentPadding: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noteContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
