import React from "react";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
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
  Dimensions,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail, ContentTab } from "../../hooks/useNoteDetail";
import { format } from "date-fns";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";

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
  const router = useRouter();
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
    handleDeleteNote,
  } = useNoteDetail(id);

  const { width } = Dimensions.get("window");
  const translateX = useSharedValue(0);

  const tabs: ContentTab[] = [
    "note",
    "transcript",
    "summary",
    "quiz",
    "flashcards",
  ];
  const currentTabIndex = tabs.indexOf(activeContentTab);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      translateX.value = 0;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const swipeThreshold = width * 0.2;
      if (Math.abs(event.translationX) > swipeThreshold) {
        if (event.translationX > 0 && currentTabIndex > 0) {
          // Swipe right
          runOnJS(handleTabPress)(tabs[currentTabIndex - 1] as ContentTab);
        } else if (
          event.translationX < 0 &&
          currentTabIndex < tabs.length - 1
        ) {
          // Swipe left
          runOnJS(handleTabPress)(tabs[currentTabIndex + 1] as ContentTab);
        }
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (loading) return <LoadingScreen />;
  if (!note) return <Text>Note not found</Text>;

  // Display generation error if any
  if (generationError) {
    Alert.alert("Generation Error", generationError);
    // Optionally reset the error state here if needed
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

  const renderContent = () => {
    switch (activeContentTab) {
      case "note":
        return (
          <>
            <NoteTitleSection
              title={note.title}
              lastModified={
                note.updatedAt instanceof Date
                  ? format(note.updatedAt, "MMM d, yyyy")
                  : format(
                      new Date(note.updatedAt || Date.now()),
                      "MMM d, yyyy"
                    )
              }
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
        );
      case "transcript":
        return (
          note.fullText && <TranscriptContent transcript={note.fullText} />
        );
      case "summary":
        return (
          note.summary && (
            <View style={styles.textContentPadding}>
              <SummaryContent content={note.summary} />
            </View>
          )
        );
      case "quiz":
        return (
          <View style={styles.textContentPadding}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note.quizzes && note.quizzes.length > 0 ? (
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
        );
      case "flashcards":
        return (
          <View style={styles.textContentPadding}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <LoadingScreen />
              </View>
            ) : note.flashcards && note.flashcards.length > 0 ? (
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
        );
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <NoteDetailHeader
          title={note.title}
          onBackPress={handleBackPress}
          onOptionsPress={handleOptionsPress}
          onDelete={onDelete}
        />
        <ContentTabs activeTab={activeContentTab} onTabPress={handleTabPress} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {renderContent()}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
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
