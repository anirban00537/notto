import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail } from "../../hooks/useNoteDetail";
import { format } from "date-fns";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

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
import ContentTabs from "../../components/ContentTabs";
import { mapNoteFlashcardsToUIFlashcards } from "../../lib/utils/flashcardMapper";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    note,
    loading,
    activeTab,
    handleTabPress,
    handleSwipeChange,
    handleOptionsPress,
    handleBackPress,
    isGenerating,
    handleGenerateMaterials,
    onDelete,
    iconProps,
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
        onDelete={onDelete}
      />

      <ContentTabs
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onSwipeChange={handleSwipeChange}
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
            iconName={iconProps.name as any}
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
              <Animated.View
                style={styles.emptyStateContainer}
                entering={FadeIn.duration(400)}
              >
                <Animated.View
                  style={styles.emptyStateCard}
                  entering={ZoomIn.delay(300).duration(500)}
                >
                  <EmptyState
                    iconName="clipboard-edit-outline"
                    message="No quiz available yet."
                    description="Generate quiz questions and flashcards based on your note content to help you study more effectively."
                    buttonText="Generate Quiz & Flashcards"
                    onPress={handleGenerateMaterials}
                    loading={isGenerating}
                    disabled={isGenerating}
                  />
                </Animated.View>
              </Animated.View>
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
                flashcards={mapNoteFlashcardsToUIFlashcards(note.flashcards)}
              />
            ) : (
              <Animated.View
                style={styles.emptyStateContainer}
                entering={FadeIn.duration(400)}
              >
                <Animated.View
                  style={styles.emptyStateCard}
                  entering={ZoomIn.delay(300).duration(500)}
                >
                  <EmptyState
                    iconName="cards-outline"
                    message="No flashcards available yet."
                    description="Create flashcards to test your knowledge and help reinforce what you've learned from your notes."
                    buttonText="Generate Quiz & Flashcards"
                    onPress={handleGenerateMaterials}
                    loading={isGenerating}
                    disabled={isGenerating}
                  />
                </Animated.View>
              </Animated.View>
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Dimensions.get("window").height - 250,
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyStateCard: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 20,
    padding: 24,
    minHeight: 450,
    justifyContent: "center",
  },
});
