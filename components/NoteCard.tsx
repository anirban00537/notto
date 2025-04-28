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
          bgColor: "rgba(255, 245, 236, 0.7)",
        };
      default:
        return {
          name: "note-text-outline" as IconName,
          color: "#4CAF50",
          bgColor: "rgba(232, 245, 233, 0.7)",
        };
    }
  };

  const typeData = getTypeData(icon);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const shadowAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 8,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Interpolate shadow and transform properties for smooth animation
  const animatedShadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.18],
  });

  const animatedShadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 16],
  });

  const animatedElevation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 8],
  });

  const animatedTranslateY = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.noteCard,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: animatedTranslateY },
            ],
            shadowOpacity: animatedShadowOpacity,
            shadowRadius: animatedShadowRadius,
            elevation: animatedElevation,
          },
        ]}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: typeData.bgColor }]}
        >
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
    marginBottom: 8,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(240, 244, 250, 0.6)",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  noteContent: {
    flex: 1,
    paddingVertical: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  contentPreview: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 8,
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
    color: "#95a5a6",
    fontWeight: "500",
  },
});

export default NoteCard;
