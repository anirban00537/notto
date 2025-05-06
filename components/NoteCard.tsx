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
  createdAt: Date | { seconds: number; nanoseconds: number } | string | number;
  icon?: string;
  onPress?: () => void;
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

  // Convert createdAt to a valid Date object
  const getValidDate = () => {
    try {
      if (createdAt instanceof Date) {
        return createdAt;
      } else if (
        typeof createdAt === "object" &&
        createdAt !== null &&
        "seconds" in createdAt
      ) {
        // Handle Firestore timestamp
        return new Date(createdAt.seconds * 1000);
      } else if (
        typeof createdAt === "string" ||
        typeof createdAt === "number"
      ) {
        return new Date(createdAt);
      } else {
        return new Date(); // Fallback to current date
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date(); // Fallback to current date
    }
  };

  const dateToDisplay = getValidDate();

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
      {typeof onPress === "function" ? (
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.7}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${typeData.color}15` },
              ]}
            >
              <MaterialCommunityIcons
                name={typeData.name}
                size={24}
                color={typeData.color}
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[Typography.body1, styles.title]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>

              <View style={styles.dateContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color="#999"
                  style={styles.timeIcon}
                />
                <Text style={[Typography.caption, styles.dateText]}>
                  {format(dateToDisplay, "MMM d, yyyy · h:mm a")}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.content}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${typeData.color}15` },
              ]}
            >
              <MaterialCommunityIcons
                name={typeData.name}
                size={24}
                color={typeData.color}
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[Typography.body1, styles.title]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>

              <View style={styles.dateContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color="#999"
                  style={styles.timeIcon}
                />
                <Text style={[Typography.caption, styles.dateText]}>
                  {format(dateToDisplay, "MMM d, yyyy · h:mm a")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {},
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    marginBottom: 6,
    color: "#333333",
    fontFamily: FONTS.medium,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  dateText: {
    color: "#999",
  },
});

export default NoteCard;
