import React, { RefObject, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Typography, FONTS } from "@/constants/Typography";
import { Colors } from "@/constants/Colors";

interface TemplateModalsProps {
  bottomSheetRef: RefObject<BottomSheet>;
  noteId: string;
  noteTitle?: string;
}

const TemplateModals: React.FC<TemplateModalsProps> = ({
  bottomSheetRef,
  noteId,
  noteTitle = "Untitled",
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  // Modal snap points
  const snapPoints = React.useMemo(() => ["35%"], []);

  // Navigation functions
  const navigateToQuiz = () => {
    bottomSheetRef.current?.close();
    router.push({
      pathname: "/quiz",
      params: { noteId, title: noteTitle },
    });
  };

  const navigateToFlashcards = () => {
    bottomSheetRef.current?.close();
    router.push({
      pathname: "/flashcards",
      params: { noteId, title: noteTitle },
    });
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}
      onChange={(index) => {
        setIsSheetOpen(index >= 0);
      }}
    >
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Select Template</Text>
      </View>
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.templateOption}
          onPress={navigateToQuiz}
          activeOpacity={0.7}
        >
          <View style={styles.templateIconContainer}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={28}
              color={Colors.light.tint}
            />
          </View>
          <View style={styles.templateTextContainer}>
            <Text style={styles.templateOptionTitle}>Quiz</Text>
            <Text style={styles.templateOptionDesc}>
              Generate quiz questions based on your note content
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.light.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.templateOption}
          onPress={navigateToFlashcards}
          activeOpacity={0.7}
        >
          <View style={styles.templateIconContainer}>
            <MaterialCommunityIcons
              name="card-text-outline"
              size={28}
              color={Colors.light.tint}
            />
          </View>
          <View style={styles.templateTextContainer}>
            <Text style={styles.templateOptionTitle}>Flashcards</Text>
            <Text style={styles.templateOptionDesc}>
              Create flashcards to test your knowledge
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.light.icon}
          />
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleIndicator: {
    backgroundColor: Colors.light.secondaryText,
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  drawerHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: Colors.light.text,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  templateOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.light.tintBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  templateTextContainer: {
    flex: 1,
  },
  templateOptionTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: Colors.light.text,
    marginBottom: 4,
  },
  templateOptionDesc: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.light.secondaryText,
  },
});

export default TemplateModals;
