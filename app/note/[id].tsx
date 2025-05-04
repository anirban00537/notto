import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail } from "../../hooks/useNoteDetail";
import { format } from "date-fns";

// Import the components
import AudioPreview from "../../components/AudioPreview";
import PDFPreview from "../../components/PDFPreview";
import NoteDetailHeader from "../../components/NoteDetailHeader";
import YouTubePreview from "../../components/YouTubePreview";
import NoteTitleSection from "../../components/NoteTitleSection";
import TranscriptContent from "../../components/TranscriptContent";
import LoadingScreen from "@/components/LoadingScreen";
import QuizComponent from "@/components/QuizComponent";
import FlashcardComponent from "@/components/FlashcardComponent";
import EmptyState from "../../components/EmptyState";
import NoteContent from "../../components/NoteContent";
import SummaryContent from "../../components/SummaryContent";
import ContentTabs, { TabName, TABS } from "../../components/ContentTabs";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    note,
    loading,
    handleOptionsPress,
    handleDeleteNote,
    handleBackPress,
    isGenerating,
    generationError,
    handleGenerateMaterials,
  } = useNoteDetail(id);

  const [activeTab, setActiveTab] = useState<TabName>("note");

  // Note icon properties
  const iconProps = {
    name: "note-text-outline" as const,
    color: "#2c3e50",
    bgColor: "#f5f7fa",
  };

  if (loading) return <LoadingScreen />;
  if (!note) return <Text>Note not found</Text>;

  if (generationError) {
    Alert.alert("Generation Error", generationError);
  }

  const onDelete = async () => {
    try {
      await handleDeleteNote();
      router.back();
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "Failed to delete note. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NoteDetailHeader
        title={note.title}
        onBackPress={handleBackPress}
        onOptionsPress={handleOptionsPress}
        onDelete={onDelete}
      />

      <ContentTabs
        activeTab={activeTab}
        onTabPress={setActiveTab}
        onSwipeChange={setActiveTab}
      >
        {/* Note Tab */}
        <ScrollView style={styles.scene}>
          <NoteTitleSection
            title={note?.title || ""}
            lastModified={
              note?.updatedAt instanceof Date
                ? format(note.updatedAt, "MMM d, yyyy")
                : format(new Date(note?.updatedAt || Date.now()), "MMM d, yyyy")
            }
            iconName={iconProps.name}
            iconColor={iconProps.color}
            iconBackgroundColor={iconProps.bgColor}
          />
          {note?.sourceUrl && note?.noteType === "youtube" && (
            <YouTubePreview directPlayableUrl={note.sourceUrl} />
          )}
          {note?.sourceUrl && note?.noteType === "audio" && (
            <AudioPreview directPlayableUrl={note.sourceUrl} />
          )}
          {note?.sourceUrl && note?.noteType === "pdf" && (
            <PDFPreview directPlayableUrl={note.sourceUrl} />
          )}
          <View style={styles.textContentPadding}>
            {note?.note && <NoteContent content={note.note} />}
          </View>
        </ScrollView>

        {/* Transcript Tab */}
        <ScrollView style={styles.scene}>
          {note?.fullText && <TranscriptContent transcript={note.fullText} />}
        </ScrollView>

        {/* Summary Tab */}
        <ScrollView style={styles.scene}>
          <View style={styles.textContentPadding}>
            {note?.summary && <SummaryContent content={note.summary} />}
          </View>
        </ScrollView>

        {/* Quiz Tab */}
        <ScrollView style={styles.scene}>
          <View style={styles.textContentPadding}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note?.quizzes && note.quizzes.length > 0 ? (
              <QuizComponent
                quiz={{
                  ...note.quizzes[0],
                  title: note.title || "Quiz",
                }}
              />
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
        </ScrollView>

        {/* Flashcards Tab */}
        <ScrollView style={styles.scene}>
          <View style={styles.textContentPadding}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note?.flashcards && note.flashcards.length > 0 ? (
              <FlashcardComponent
                flashcards={note.flashcards.map((card) => ({
                  question: card.front,
                  answer: card.back,
                  hints: [],
                }))}
              />
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
        </ScrollView>
      </ContentTabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  scene: {
    flex: 1,
    backgroundColor: "#f0f7ff",
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
