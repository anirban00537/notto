import React from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  DimensionValue,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Shimmer effect for skeleton loading
const Shimmer = ({
  width,
  height,
  borderRadius = 12,
}: {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  // Calculate numeric width for animations
  const numericWidth =
    typeof width === "string"
      ? (parseFloat(width) / 100) * screenWidth
      : (width as number);

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-numericWidth, numericWidth],
  });

  return (
    <View
      style={[
        styles.shimmerContainer,
        { width: width as DimensionValue, height, borderRadius },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            width: numericWidth * 2,
            height,
          },
        ]}
      />
    </View>
  );
};

// Skeleton for a single note card matching NoteCard design
const NoteCardSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.cardContent}>
      {/* Icon container */}
      <View style={styles.iconContainer}>
        <Shimmer width={48} height={48} borderRadius={12} />
      </View>

      {/* Text container */}
      <View style={styles.textContainer}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Shimmer width={200} height={20} />
        </View>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Shimmer width={120} height={14} />
        </View>
      </View>
    </View>
  </View>
);

// Main component that shows multiple skeleton note cards
const NotesSkeleton = () => {
  // Create an array to render multiple skeleton cards
  const skeletonItems = Array(5)
    .fill(null)
    .map((_, index) => <NoteCardSkeleton key={index} />);

  return (
    <View style={styles.skeletonContainer}>
      {/* Folder selector skeleton */}
      <View style={styles.folderSelector}>
        <Shimmer width={"80%"} height={48} borderRadius={25} />
      </View>

      {/* Notes list skeleton */}
      <View style={styles.notesList}>{skeletonItems}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  folderSelector: {
    marginBottom: 24,
    alignItems: "center",
  },
  notesList: {
    paddingBottom: 100,
  },
  container: {
    borderRadius: 16,
    marginVertical: 2,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleContainer: {
    marginBottom: 6,
  },
  dateContainer: {
    marginTop: 4,
  },
  shimmerContainer: {
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
  },
  shimmer: {
    position: "absolute",
    backgroundColor: "#F5F5F5",
    height: "100%",
    opacity: 0.6,
    borderRadius: 16,
  },
});

export default NotesSkeleton;
