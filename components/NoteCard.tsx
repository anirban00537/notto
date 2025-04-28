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

// Define the icon names type to match available MaterialCommunityIcons
type IconName =
  | "file-pdf-box"
  | "volume-high"
  | "youtube"
  | "palette"
  | "note-text-outline";

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
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Get icon and color based on note type
  const getTypeData = (iconType?: string) => {
    switch (iconType) {
      case "pdf":
        return {
          name: "file-pdf-box" as IconName,
          color: "#D32F2F",
          bgColor: "#FFEBEE",
          label: "PDF",
        };
      case "audio":
        return {
          name: "volume-high" as IconName,
          color: "#1976D2",
          bgColor: "#E3F2FD",
          label: "AUDIO",
        };
      case "youtube":
        return {
          name: "youtube" as IconName,
          color: "#FF0000",
          bgColor: "#FFEBEE",
          label: "YOUTUBE",
        };
      case "palette":
        return {
          name: "palette" as IconName,
          color: "#EB6C3E",
          bgColor: "#FFF5EC",
          label: "PALETTE",
        };
      default:
        return {
          name: "note-text-outline" as IconName,
          color: "#4CAF50",
          bgColor: "#E8F5E9",
          label: null,
        };
    }
  };

  const typeData = getTypeData(icon);

  return (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: typeData.bgColor }]}
      >
        <MaterialCommunityIcons
          name={typeData.name}
          size={26}
          color={typeData.color}
        />
      </View>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(249, 252, 255, 0.97)",
    borderWidth: 1,
    borderColor: "#f0f4fa",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  noteContent: {
    flex: 1,
    paddingVertical: 2,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    color: "#95a5a6",
    fontWeight: "500",
  },
});

export default NoteCard;
