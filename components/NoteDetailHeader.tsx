import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#333" />
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
        <MaterialCommunityIcons name="dots-horizontal" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f0f7ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6f0ff",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 6,
  },
  optionsButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
    paddingVertical: 6,
  },
});
