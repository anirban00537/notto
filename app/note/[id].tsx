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
import { getNoteById } from "../../lib/services/noteService";

// Import the new components
import NoteDetailHeader from "../../components/NoteDetailHeader";
import YouTubePreview from "../../components/YouTubePreview";
import ActionButtons from "../../components/ActionButtons";
import NoteTitleSection from "../../components/NoteTitleSection";
import ContentTabs from "../../components/ContentTabs";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [note, setNote] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getNoteById(id);
        console.log("Fetched note:", data);
        setNote(data);
      } catch (e) {
        console.error("Error fetching note:", e);
        setNote(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Text>Loading...</Text>;
  if (!note) return <Text>Note not found</Text>;

  const [activeContentTab, setActiveContentTab] = React.useState<
    "note" | "transcript" | "chat"
  >("note");

  const handleTabPress = (tab: "note" | "transcript" | "chat") => {
    setActiveContentTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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
        return { name: "note-text-outline", color: "#888", bgColor: "#f0f0f0" };
    }
  };
  const iconProps = getIconProps(note.noteType || note.icon);

  const handleOptionsPress = () => console.log("Options pressed");
  const handleNoteToolsPress = () => console.log("Note Tools pressed");
  const handleEditNotePress = () => console.log("Edit Note pressed");

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
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
        {activeContentTab === "note" && (
          <>
            {note.youtubeUrl && (
              <YouTubePreview directPlayableUrl={note.youtubeUrl} />
            )}
            <ActionButtons
              onNoteToolsPress={handleNoteToolsPress}
              onEditNotePress={handleEditNotePress}
            />
            <NoteTitleSection
              title={note.title}
              lastModified={note.updatedAt || note.lastModified || ""}
              iconName={iconProps.name as any}
              iconColor={iconProps.color}
              iconBackgroundColor={iconProps.bgColor}
            />
            <View style={styles.textContentPadding}>
              <Text style={styles.noteContentText}>
                {note.content || note.fullText || note.summary || ""}
              </Text>
              <Text
                style={{ fontSize: 12, color: "#888", marginTop: 16 }}
                selectable
              >
                {JSON.stringify(note, null, 2)}
              </Text>
            </View>
          </>
        )}
        {activeContentTab === "transcript" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              {note.transcript || "Transcript content would go here..."}
            </Text>
          </View>
        )}
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
