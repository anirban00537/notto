import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AudioPreview from "../../components/AudioPreview";
import PDFPreview from "../../components/PDFPreview";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
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
import QuizComponent from "@/components/QuizComponent";
import FlashcardComponent from "@/components/FlashcardComponent";
import EmptyState from "../../components/EmptyState";
import NoteContent from "../../components/NoteContent";
import SummaryContent from "../../components/SummaryContent";

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
    isGenerating,
    generationError,
    handleGenerateMaterials,
  } = useNoteDetail(id);

  if (loading) return <LoadingScreen />;
  if (!note) return <Text>Note not found</Text>;

  // Display generation error if any
  if (generationError) {
    Alert.alert("Generation Error", generationError);
    // Optionally reset the error state here if needed
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <ContentTabs
            activeTab={activeContentTab}
            onTabPress={handleTabPress}
          />
          {activeContentTab === "note" && (
            <>
              <NoteTitleSection
                title={note.title}
                lastModified={note.updatedAt || note.lastModified || ""}
                iconName={iconProps.name as any}
                iconColor={iconProps.color}
                iconBackgroundColor={iconProps.bgColor}
              />
              {note.sourceUrl && note.noteType === "youtube" && (
                <YouTubePreview directPlayableUrl={note.sourceUrl} />
              )}
              {note.sourceUrl && note.noteType === "audio" && (
                <AudioPreview directPlayableUrl={note.sourceUrl} />
              )}
              {note.sourceUrl && note.noteType === "pdf" && (
                <PDFPreview directPlayableUrl={note.sourceUrl} />
              )}

              <View style={styles.textContentPadding}>
                {note.note && <NoteContent content={note.note} />}
              </View>
            </>
          )}
          {activeContentTab === "transcript" && (
            <TranscriptContent transcript={note.fullText} />
          )}
          {activeContentTab === "summary" && (
            <View style={styles.textContentPadding}>
              <SummaryContent content={note.summary} />
            </View>
          )}
          {activeContentTab === "quiz" && (
            <View style={styles.textContentPadding}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <LoadingScreen />
                </View>
              ) : note.quizzes && note.quizzes.length > 0 ? (
                <QuizComponent quiz={note.quizzes[0]} />
              ) : (
                <EmptyState
                  iconName="clipboard-edit-outline"
                  message="No quiz available yet."
                  buttonText="Generate Quiz & Flashcards"
                  onPress={handleGenerateMaterials}
                  loading={isGenerating}
                  disabled={isGenerating}
                />
              )}
            </View>
          )}
          {activeContentTab === "flashcards" && (
            <View style={styles.textContentPadding}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <LoadingScreen />
                </View>
              ) : note.flashcards && note.flashcards.length > 0 ? (
                <FlashcardComponent flashcards={note.flashcards} />
              ) : (
                <EmptyState
                  iconName="cards-outline"
                  message="No flashcards available yet."
                  buttonText="Generate Quiz & Flashcards"
                  onPress={handleGenerateMaterials}
                  loading={isGenerating}
                  disabled={isGenerating}
                />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
});
