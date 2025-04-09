import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  icon?: string;
  onPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  id,
  title,
  content,
  createdAt,
  icon,
  onPress,
}) => {
  const renderNoteIcon = (iconName?: string) => {
    let iconComponent: keyof typeof MaterialCommunityIcons.glyphMap | null =
      null;
    let iconColor: string | null = null;
    let backgroundColor: string | null = null;

    switch (iconName) {
      case "pdf":
        iconComponent = "file-pdf-box";
        iconColor = "#D32F2F";
        backgroundColor = "#FFEBEE";
        break;
      case "audio":
        iconComponent = "file-music-outline";
        iconColor = "#1976D2";
        backgroundColor = "#E3F2FD";
        break;
      case "youtube":
        iconComponent = "youtube";
        iconColor = "#FF0000";
        backgroundColor = "#FFEBEE";
        break;
      case "palette":
        iconComponent = "palette";
        iconColor = "#EB6C3E";
        backgroundColor = "#FFF5EC";
        break;
      default:
        iconComponent = "note-text-outline";
        iconColor = "#2c3e50";
        backgroundColor = "#f0f7ff";
    }

    if (iconComponent && iconColor && backgroundColor) {
      return (
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <MaterialCommunityIcons
            name={iconComponent}
            size={28}
            color={iconColor}
          />
        </View>
      );
    }
    return null;
  };

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

  return (
    <TouchableOpacity style={styles.noteCard} onPress={onPress}>
      {renderNoteIcon(icon)}
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{title}</Text>
        <Text style={styles.notePreview} numberOfLines={1}>
          {content}
        </Text>
      </View>
      <Text style={styles.noteDate}>{formatDate(createdAt)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#f0f0f0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noteContent: {
    flex: 1,
    paddingRight: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  notePreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
});

export default NoteCard;
