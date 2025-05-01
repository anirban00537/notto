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
  | "note-text-outline"
  | "image-outline";

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
        };
      case "audio":
        return {
          name: "volume-high" as IconName,
          color: "#1976D2",
        };
      case "youtube":
        return {
          name: "youtube" as IconName,
          color: "#FF0000",
        };
      case "palette":
        return {
          name: "palette" as IconName,
          color: "#EB6C3E",
        };
      case "image":
        return {
          name: "image-outline" as IconName,
          color: "#9C27B0",
          bgColor: "rgba(243, 229, 245, 0.9)",
        };
      default:
        return {
          name: "note-text-outline" as IconName,
          color: "#4CAF50",
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
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={typeData.name}
            size={28}
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
  container: {
    marginHorizontal: 20,
    marginVertical: 4,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 7,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  noteContent: {
    flex: 1,
    justifyContent: "center",
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  contentPreview: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 4,
    letterSpacing: -0.2,
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
    color: "#999999",
    letterSpacing: -0.1,
  },
});

export default NoteCard;
