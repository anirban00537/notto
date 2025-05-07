import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";
import { useNoteDetail } from "@/hooks/useNoteDetail";
import FlashcardsComponent from "@/components/FlashcardsComponent";

export default function FlashcardsScreen() {
  const router = useRouter();
  const { noteId, title } = useLocalSearchParams<{
    noteId: string;
    title: string;
  }>();

  const { note, loading, isGenerating, handleGenerateMaterials } =
    useNoteDetail(noteId);

  const handleBackPress = () => {
    router.back();
  };

  if (loading) return <LoadingScreen />;
  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={Typography.body1}>Note not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButtonContainer}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Flashcards</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {isGenerating ? (
          <View style={styles.loadingContainer}>
            <LoadingScreen />
          </View>
        ) : note?.flashcards && note.flashcards.length > 0 ? (
          <View style={styles.flashcardsContainer}>
            <FlashcardsComponent
              flashcards={note.flashcards}
              title={note.title || "Flashcards"}
            />
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              iconName="card-text-outline"
              message="No flashcards available yet."
              description="Generate flashcards based on your note content to help you study more effectively."
              buttonText="Generate Quiz & Flashcards"
              onPress={handleGenerateMaterials}
              loading={isGenerating}
              disabled={isGenerating}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  backButtonContainer: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: Colors.light.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flashcardsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.light.background,
    fontFamily: FONTS.medium,
  },
});
