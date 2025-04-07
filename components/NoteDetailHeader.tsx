import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface NoteDetailHeaderProps {
  onBackPress: () => void;
  onOptionsPress: () => void;
}

export default function NoteDetailHeader({
  onBackPress,
  onOptionsPress,
}: NoteDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
        <MaterialCommunityIcons name="chevron-left" size={30} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onOptionsPress} style={styles.headerButton}>
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
    paddingVertical: 2,
    backgroundColor: "#fff",
  },
  headerButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
});
