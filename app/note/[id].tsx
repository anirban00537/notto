import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail } from "../../hooks/useNoteDetail";

// Import the new components
import NoteDetailHeader from "../../components/NoteDetailHeader";
import YouTubePreview from "../../components/YouTubePreview";
import ActionButtons from "../../components/ActionButtons";
import NoteTitleSection from "../../components/NoteTitleSection";
import ContentTabs from "../../components/ContentTabs";
import TranscriptContent from "../../components/TranscriptContent";
import LoadingScreen from "@/components/LoadingScreen";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    note,
    loading,
    activeContentTab,
    scrollViewRef,
    iconProps,
    handleTabPress,
    handleOptionsPress,
    handleNoteToolsPress,
    handleEditNotePress,
    handleBackPress,
  } = useNoteDetail(id);

  if (loading) return <LoadingScreen />;
  if (!note) return <Text>Note not found</Text>;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NoteDetailHeader
        title={note.title}
        onBackPress={handleBackPress}
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
            {note.sourceUrl && (
              <YouTubePreview directPlayableUrl={note.sourceUrl} />
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
              {note.note && (
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Note</Text>
                  <Text style={styles.noteContentText}>{note.note}</Text>
                </View>
              )}
            </View>
          </>
        )}
        {activeContentTab === "transcript" && (
          <TranscriptContent transcript={note.fullText} />
        )}
        {activeContentTab === "chat" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              Chat content would go here...
            </Text>
          </View>
        )}
        {activeContentTab === "summary" && (
          <View style={styles.textContentPadding}>
            {note.summary ? (
              <Text style={styles.noteContentText}>{note.summary}</Text>
            ) : (
              <Text style={styles.noteContentText}>No summary available</Text>
            )}
          </View>
        )}
        {activeContentTab === "quiz" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              Quiz feature coming soon...
            </Text>
          </View>
        )}
        {activeContentTab === "flashcards" && (
          <View style={styles.textContentPadding}>
            <Text style={styles.noteContentText}>
              Flashcards feature coming soon...
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
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  noteContentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
