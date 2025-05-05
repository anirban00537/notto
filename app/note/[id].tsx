import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail } from "../../hooks/useNoteDetail";
import { format } from "date-fns";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Typography, FONTS } from "@/constants/Typography";

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
  } = useNoteDetail(id);

  if (loading) return <LoadingScreen />;
  if (!note) return <Text style={Typography.body1}>Note not found</Text>;

  const getFormattedTitle = () => {
    return note?.title?.trim() || "Untitled Note";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <NoteDetailHeader
        title={getFormattedTitle()}
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
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {note?.sourceUrl && (
              <View style={styles.mediaContainer}>
                {note.noteType === "youtube" && (
                  <YouTubePreview directPlayableUrl={note.sourceUrl} />
                )}
                {note.noteType === "audio" && (
                  <AudioPreview directPlayableUrl={note.sourceUrl} />
                )}
                {note.noteType === "pdf" && (
                  <PDFPreview directPlayableUrl={note.sourceUrl} />
                )}
              </View>
            )}

            <View style={styles.contentCard}>
              <NoteTitleSection
                title={getFormattedTitle()}
                lastModified={
                  note?.updatedAt instanceof Date
                    ? format(note.updatedAt, "MMM d, yyyy")
                    : format(
                        new Date(note?.updatedAt || Date.now()),
                        "MMM d, yyyy"
                      )
                }
                showFullTitle={true}
                insideCard={true}
              />

              {note?.note && (
                <View style={styles.noteTextContainer}>
                  <NoteContent content={note.note} />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Transcript Tab */}
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {note?.fullText ? (
              <View style={styles.contentCard}>
                <TranscriptContent transcript={note.fullText} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={Typography.body1}>No transcript available</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Summary Tab */}
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {note?.summary ? (
              <View style={styles.contentCard}>
                <SummaryContent content={note.summary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={Typography.body1}>No summary available</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Quiz Tab */}
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note?.quizzes && note.quizzes.length > 0 ? (
              <View style={styles.quizContainer}>
                <QuizComponent
                  quiz={{
                    ...note.quizzes[0],
                    title: note.title || "Quiz",
                  }}
                />
              </View>
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
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note?.flashcards && note.flashcards.length > 0 ? (
              <View style={styles.flashcardsContainer}>
                <FlashcardComponent
                  flashcards={mapNoteFlashcardsToUIFlashcards(note.flashcards)}
                />
              </View>
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
    backgroundColor: "#ffffff",
  },
  scene: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContentContainer: {
    paddingBottom: 40,
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
  noteContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: "100%",
  },
  mediaContainer: {
    marginBottom: 20,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: "hidden",
    width: "100%",
  },
  contentCard: {
    backgroundColor: "transparent",
    padding: 0,
    marginHorizontal: 20,
    marginBottom: 0,
    marginTop: 0,
    width: "auto",
  },
  noteTextContainer: {
    paddingVertical: 16,
    marginTop: 5,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
    minHeight: 150,
  },
  quizContainer: {
    backgroundColor: "transparent",
    padding: 0,
    marginHorizontal: 20,
  },
  flashcardsContainer: {
    backgroundColor: "transparent",
    padding: 0,
    marginHorizontal: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Dimensions.get("window").height - 250,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateCard: {
    width: "100%",
    backgroundColor: "transparent",
    padding: 0,
    minHeight: 450,
    justifyContent: "center",
  },
});
