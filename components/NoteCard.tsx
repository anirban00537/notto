import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface NoteCardProps {
  id: string;
  title?: string;
  content?: string;
  createdAt: Date;
  icon?: string;
  onPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  id,
  title = "Untitled Note",
  content = "No content",
  createdAt,
  icon,
  onPress,
}) => {
  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };

  const getTagData = (iconType?: string) => {
    switch (iconType) {
      case "pdf":
        return { name: "PDF", color: "#D32F2F", bgColor: "#FFEBEE" };
      case "audio":
        return { name: "AUDIO", color: "#1976D2", bgColor: "#E3F2FD" };
      case "youtube":
        return { name: "YOUTUBE", color: "#FF0000", bgColor: "#FFEBEE" };
      case "palette":
        return { name: "PALETTE", color: "#EB6C3E", bgColor: "#FFF5EC" };
      default:
        return null;
    }
  };

  const tagData = getTagData(icon);

  return (
    <TouchableOpacity style={styles.noteCard} onPress={onPress}>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{title}</Text>
        <View style={styles.bottomContent}>
          <Text style={styles.noteDate}>{formatDate(createdAt)}</Text>
          {tagData && (
            <View style={[styles.tag, { backgroundColor: tagData.bgColor }]}>
              <Text style={[styles.tagText, { color: tagData.color }]}>
                {tagData.name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e8f5", 
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "500", // Medium bold
    color: "#111", // Dark text for light theme
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDate: {
    fontSize: 10,
    color: "#999", // Subtle gray for date
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "#f7faff", // Light tag background
  },
  tagText: {
    fontSize: 9,
    fontWeight: "500",
    color: "#222", // Dark tag text for light theme
  },
});

export default NoteCard;
