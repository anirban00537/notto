import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface NoteDetailHeaderProps {
  title: string;
  onBackPress: () => void;
  onOptionsPress: () => void;
}

export default function NoteDetailHeader({
  title,
  onBackPress,
  onOptionsPress,
}: NoteDetailHeaderProps) {
  const HeaderContent = () => (
    <View style={styles.headerContent}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="rgba(44, 62, 80, 0.9)"
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </ScrollView>
      </View>

      <TouchableOpacity onPress={onOptionsPress} style={styles.optionsButton}>
        <MaterialCommunityIcons
          name="dots-horizontal"
          size={28}
          color="rgba(44, 62, 80, 0.9)"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={50} tint="light" style={styles.header}>
          <HeaderContent />
        </BlurView>
      ) : (
        <View style={[styles.header, styles.androidHeader]}>
          <HeaderContent />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: "rgba(240, 247, 255, 0.45)",
  },
  header: {
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(230, 240, 255, 0.3)",
    backgroundColor: "rgba(240, 247, 255, 0.25)",
  },
  androidHeader: {
    backgroundColor: "rgba(240, 247, 255, 0.65)",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(44, 62, 80, 0.9)",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
