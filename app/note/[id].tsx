import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import Markdown from "react-native-markdown-display";

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

  const markdownStyles = {
    body: {
      color: "#333",
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      color: "#2c3e50",
    },
    heading2: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: "#2c3e50",
    },
    heading3: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#2c3e50",
    },
    link: {
      color: "#1976D2",
    },
    blockquote: {
      backgroundColor: "#f5f5f5",
      borderLeftColor: "#ccc",
      borderLeftWidth: 4,
      paddingLeft: 16,
      paddingVertical: 8,
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: "#f5f5f5",
      padding: 4,
      borderRadius: 4,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: "#f5f5f5",
      padding: 16,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: "monospace",
    },
  };

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
                    <Markdown style={markdownStyles}>{note.note}</Markdown>
                  </View>
                )}
              </View>
            </>
          )}
          {activeContentTab === "transcript" && (
            <TranscriptContent transcript={note.fullText} />
          )}
          {activeContentTab === "summary" && (
            <View style={styles.textContentPadding}>
              {note.summary ? (
                <Markdown style={markdownStyles}>{note.summary}</Markdown>
              ) : (
                <Text style={styles.noteContentText}>No summary available</Text>
              )}
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

  quizItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  quizOption: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    marginBottom: 4,
  },
  quizExplanation: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
    fontStyle: "italic",
  },
  flashcardItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  flashcardQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  flashcardAnswer: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  flashcardHints: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  generateContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  generateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  noteToolsButton: {
    backgroundColor: "#2c3e50",
  },
  noteToolsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
});
