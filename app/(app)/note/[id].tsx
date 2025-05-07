import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNoteDetail } from "../../../hooks/useNoteDetail";
import { format } from "date-fns";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Typography, FONTS } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

// Import the components
import AudioPreview from "../../../components/AudioPreview";
import PDFPreview from "../../../components/PDFPreview";
import NoteDetailHeader from "../../../components/NoteDetailHeader";
import YouTubePreview from "../../../components/YouTubePreview";
import NoteTitleSection from "../../../components/NoteTitleSection";
import TranscriptContent from "../../../components/TranscriptContent";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "../../../components/EmptyState";
import NoteContent from "../../../components/NoteContent";
import SummaryContent from "../../../components/SummaryContent";
import ContentTabs from "../../../components/ContentTabs";
import TemplateModals from "@/components/TemplateModals";
import { Colors } from "@/constants/Colors";

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    note,
    loading,
    activeTab,
    handleTabPress,
    handleSwipeChange,
    handleOptionsPress,
    handleBackPress,
  } = useNoteDetail(id);

  // Template bottom sheet reference
  const templateBottomSheetRef = useRef<BottomSheet>(null);

  // Functions for template bottom sheet
  const openTemplatesSheet = () => {
    templateBottomSheetRef.current?.snapToIndex(0);
  };

  // Navigation functions
  const navigateToQuiz = () => {
    templateBottomSheetRef.current?.close();
    router.push({
      pathname: "/quiz",
      params: { noteId: id, title: note?.title || "Untitled" },
    });
  };

  const navigateToFlashcards = () => {
    templateBottomSheetRef.current?.close();
    router.push({
      pathname: "/flashcards",
      params: { noteId: id, title: note?.title || "Untitled" },
    });
  };

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
                createdAt={note?.createdAt}
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

        {/* Summary Tab */}
        <ScrollView
          style={styles.scene}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.noteContainer}>
            {note?.summary ? (
              <View style={{ ...styles.contentCard, marginTop: 10 }}>
                <SummaryContent content={note.summary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={Typography.body1}>No summary available</Text>
              </View>
            )}
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
              <View style={{ ...styles.contentCard, marginTop: 10 }}>
                <TranscriptContent transcript={note.fullText} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={Typography.body1}>No transcript available</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ContentTabs>

      {/* Floating Template Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={openTemplatesSheet}
      >
        <MaterialCommunityIcons
          name="shape-plus"
          size={22}
          color={Colors.light.background}
        />
        <Text style={styles.floatingButtonText}>Template</Text>
      </TouchableOpacity>

      {/* Templates Bottom Sheet */}
      <TemplateModals
        bottomSheetRef={templateBottomSheetRef}
        noteId={id}
        noteTitle={note?.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scene: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
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
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.light.tint,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: Colors.light.background,
    marginLeft: 6,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
});
