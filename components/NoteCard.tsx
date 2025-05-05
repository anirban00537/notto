import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Typography, FONTS } from "../constants/Typography";

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
  // Get icon and color based on note type
  const getTypeData = (iconType?: string) => {
    switch (iconType) {
      case "pdf":
        return {
          name: "file-pdf-box" as IconName,
          color: "#D32F2F",
          label: "PDF",
        };
      case "audio":
        return {
          name: "volume-high" as IconName,
          color: "#1976D2",
          label: "Audio",
        };
      case "youtube":
        return {
          name: "youtube" as IconName,
          color: "#FF0000",
          label: "YouTube",
        };
      case "palette":
        return {
          name: "palette" as IconName,
          color: "#EB6C3E",
          label: "Palette",
        };
      case "image":
        return {
          name: "image-outline" as IconName,
          color: "#9C27B0",
          label: "Image",
        };
      default:
        return {
          name: "note-text-outline" as IconName,
          color: "#4CAF50",
          label: "Note",
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
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${typeData.color}15` },
          ]}
        >
          <MaterialCommunityIcons
            name={typeData.name}
            size={20}
            color={typeData.color}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[Typography.noteTitle, styles.title]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          <Text
            style={[Typography.body2, styles.description]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {content}
          </Text>

          <Text style={Typography.caption}>
            {format(createdAt, "MMM d, yyyy")}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  description: {
    color: "#666",
    marginBottom: 2,
  },
});

export default NoteCard;
