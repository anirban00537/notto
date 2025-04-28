import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
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
          bgColor: "rgba(255, 235, 238, 0.7)",
        };
      case "audio":
        return {
          name: "volume-high" as IconName,
          color: "#1976D2",
          bgColor: "rgba(227, 242, 253, 0.7)",
        };
      case "youtube":
        return {
          name: "youtube" as IconName,
          color: "#FF0000",
          bgColor: "rgba(255, 235, 238, 0.7)",
        };
      case "palette":
        return {
          name: "palette" as IconName,
          color: "#EB6C3E",
          bgColor: "rgba(255, 245, 236, 0.9)",
        };
      default:
        return {
          name: "note-text-outline" as IconName,
          color: "#4CAF50",
          bgColor: "rgba(232, 245, 233, 0.9)",
        };
    }
  };

  const typeData = getTypeData(icon);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 7,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.noteCard,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
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
          <Text
            style={styles.contentPreview}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {content}
          </Text>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color="#95a5a6"
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  noteContent: {
    flex: 1,
    justifyContent: "center",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  contentPreview: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "400",
  },
});

export default NoteCard;
