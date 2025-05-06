import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import NoteCard from "./NoteCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SwipeableNoteCardProps {
  id: string;
  title: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | string | number;
  icon: string;
  onPress: () => void;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export const SwipeableNoteCard = ({
  id,
  title,
  createdAt,
  icon,
  onPress,
  onDelete,
  isDeleting = false,
}: SwipeableNoteCardProps) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);

  // Prevent operation during deletion or if already deleted
  const isDisabled = isDeleting || isLocalLoading || isDeleted;

  const handleDeletePress = async () => {
    if (isDisabled) return;

    try {
      setIsLocalLoading(true);
      await onDelete();
      setIsDeleted(true);
    } catch (error) {
      console.error("Error deleting note:", error);
      // Close swipe
      swipeableRef.current?.close();
    } finally {
      setIsLocalLoading(false);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          disabled={isDisabled}
        >
          {isDeleting || isLocalLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isDeleted) {
    return null;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      enabled={!isDisabled}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <NoteCard id={id} title={title} createdAt={createdAt} icon={icon} />
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    width: 80,
    height: "100%",
    borderRadius: 12,
  },
});

export default SwipeableNoteCard;
