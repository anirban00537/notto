import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import NoteCard from "./NoteCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SwipeableNoteCardProps {
  id: string;
  title: string;
  createdAt: Date;
  icon: string;
  onPress: () => void;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

const SWIPE_THRESHOLD = -80;

export const SwipeableNoteCard = ({
  id,
  title,
  createdAt,
  icon,
  onPress,
  onDelete,
  isDeleting = false,
}: SwipeableNoteCardProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDeleted, setIsDeleted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const deleteButtonOpacity = translateX.interpolate({
    inputRange: [-100, -50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const swipeActive = useRef(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: GestureHandlerStateChangeEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.BEGAN) {
      swipeActive.current = true;
    } else if (nativeEvent.state === State.END) {
      swipeActive.current = false;
      if (
        (nativeEvent as any).translationX < SWIPE_THRESHOLD &&
        !isDeleting &&
        !isDeleted
      ) {
        // Open the delete button
        Animated.timing(translateX, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsOpen(true);
        });
      } else {
        // Reset position
        handleClose();
      }
    } else if (nativeEvent.state === State.CANCELLED) {
      swipeActive.current = false;
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 5,
    }).start();
  };

  const handleDeletePress = async () => {
    if (isDeleting || !isOpen || isLocalLoading) return;

    try {
      setIsLocalLoading(true);
      await onDelete();
      setIsDeleted(true);
      // Animate the card out after successful deletion
      Animated.timing(translateX, {
        toValue: -400,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      // If deletion fails, reset position
      handleClose();
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handlePress = () => {
    if (!swipeActive.current && !isDeleting) {
      if (isOpen) {
        handleClose();
      } else {
        onPress();
      }
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.deleteButton,
          {
            opacity: deleteButtonOpacity,
          },
        ]}
        onPress={handleDeletePress}
        disabled={isDeleting || isLocalLoading}
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
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        activeOffsetX={[-10, 10]}
        enabled={!isDeleting && !isLocalLoading}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <NoteCard
              id={id}
              title={title}
              createdAt={createdAt}
              icon={icon}
              onPress={handlePress}
            />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  cardContainer: {
    backgroundColor: "#fff",
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 6,
    marginRight: 16,
  },
});

export default SwipeableNoteCard;
