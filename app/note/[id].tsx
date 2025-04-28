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

  const markdownStyles = {
    body: {
      color: "#24292e",
      fontSize: 16,
      lineHeight: 1.6,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    },
    heading1: {
      fontSize: 32,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#eaecef",
      color: "#24292e",
    },
    heading2: {
      fontSize: 24,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#eaecef",
      color: "#24292e",
    },
    heading3: {
      fontSize: 20,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      color: "#24292e",
    },
    heading4: {
      fontSize: 16,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      color: "#24292e",
    },
    heading5: {
      fontSize: 14,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      color: "#24292e",
    },
    heading6: {
      fontSize: 12,
      fontWeight: "600" as const,
      marginTop: 24,
      marginBottom: 16,
      color: "#24292e",
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 16,
    },
    link: {
      color: "#0366d6",
      textDecorationLine: "none" as const,
    },
    blockquote: {
      backgroundColor: "#f6f8fa",
      borderLeftColor: "#dfe2e5",
      borderLeftWidth: 4,
      paddingLeft: 16,
      paddingVertical: 8,
      marginVertical: 16,
      marginHorizontal: 0,
      color: "#6a737d",
    },
    code_inline: {
      backgroundColor: "rgba(27, 31, 35, 0.05)",
      padding: 4,
      paddingHorizontal: 6,
      borderRadius: 3,
      fontFamily:
        'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: 14,
      color: "#24292e",
    },
    code_block: {
      backgroundColor: "#f6f8fa",
      padding: 16,
      borderRadius: 6,
      marginVertical: 16,
      fontFamily:
        'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: 14,
      lineHeight: 1.45,
      overflow: "scroll" as const,
    },
    list_item: {
      marginBottom: 4,
    },
    bullet_list: {
      marginTop: 0,
      marginBottom: 16,
      paddingLeft: 32,
    },
    ordered_list: {
      marginTop: 0,
      marginBottom: 16,
      paddingLeft: 32,
    },
    list_item_bullet: {
      color: "#24292e",
    },
    list_item_number: {
      color: "#24292e",
    },
    strong: {
      fontWeight: "600" as const,
    },
    em: {
      fontStyle: "italic" as const,
    },
    strikethrough: {
      textDecorationLine: "line-through" as const,
    },
    table: {
      marginVertical: 16,
      borderWidth: 1,
      borderColor: "#dfe2e5",
      borderRadius: 6,
    },
    tableHeader: {
      backgroundColor: "#f6f8fa",
      borderBottomWidth: 1,
      borderBottomColor: "#dfe2e5",
      padding: 8,
    },
    tableHeaderCell: {
      color: "#24292e",
      fontWeight: "600" as const,
      padding: 8,
    },
    tableCell: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#dfe2e5",
    },
    tableRow: {
      borderBottomWidth: 1,
      borderBottomColor: "#dfe2e5",
    },
    image: {
      marginVertical: 16,
      borderRadius: 6,
    },
    hr: {
      height: 1,
      backgroundColor: "#e1e4e8",
      marginVertical: 24,
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
