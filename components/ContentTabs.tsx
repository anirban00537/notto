import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type TabName = "note" | "transcript" | "summary" | "flashcard" | "quizzes";

interface ContentTabsProps {
  activeTab: TabName;
  onTabPress: (tabName: TabName) => void;
}

const TABS: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: "note", label: "Note", icon: "note-text-outline" },
  { name: "transcript", label: "Transcript", icon: "script-text-outline" },
  { name: "flashcard", label: "Flashcard", icon: "cards-outline" },
  { name: "quizzes", label: "Quizzes", icon: "help-circle-outline" },
  { name: "summary", label: "Summary", icon: "text-short" },
];

// Create animated component for Icon
const AnimatedIcon = Reanimated.createAnimatedComponent(MaterialCommunityIcons);

// Define styles before components that use them
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    // Add subtle shadow for elevation
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
        // Keep a subtle border on Android if elevation alone isn't enough
        // Note: Sometimes direct border styles might conflict with elevation, test carefully
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(0,0,0,0.1)",
      },
    }),
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tab: {
    marginHorizontal: 4, // Slightly reduce horizontal margin
    borderRadius: 8, // Add slight rounding
    overflow: "hidden", // Ensure background clips to rounded corners
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10, // Reduce vertical padding
    paddingHorizontal: 20, // Reduce horizontal padding slightly
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  tabInnerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

interface TabItemProps {
  tabData: (typeof TABS)[0];
  isActive: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

// Separate Tab Item component for cleaner animation logic
const TabItem: React.FC<TabItemProps> = ({
  tabData,
  isActive,
  onPress,
  onLayout,
}) => {
  // Shared value for animation progress (0: inactive, 1: active)
  const progress = useSharedValue(0);

  // Update progress with animation when isActive changes
  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive, progress]);

  // Animated style for tab background
  const tabAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", "#111"] // Inactive: transparent, Active: black
    );
    return {
      backgroundColor,
    };
  });

  // Animated style for icon color
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["#888", "#fff"] // Lighter inactive gray, Active: white
    );
    return {
      color,
    };
  });

  // Animated style for text color
  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["#888", "#fff"] // Lighter inactive gray, Active: white
    );
    return {
      color,
    };
  });

  // Animated style for subtle slide-up translation
  const translateAnimatedStyle = useAnimatedStyle(() => {
    const translateY = withTiming(isActive ? -2 : 0, { duration: 200 }); // Slightly less translation
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <TouchableOpacity
      key={tabData.name}
      style={styles.tab}
      onPress={onPress}
      onLayout={onLayout}
      activeOpacity={0.7} // Increase touch feedback visibility
    >
      <Reanimated.View style={[styles.tabContent, tabAnimatedStyle]}>
        <Reanimated.View
          style={[styles.tabInnerContent, translateAnimatedStyle]}
        >
          <AnimatedIcon
            name={tabData.icon}
            size={20}
            style={[styles.tabIcon, iconAnimatedStyle]}
          />
          <Reanimated.Text style={[styles.tabText, textAnimatedStyle]}>
            {tabData.label}
          </Reanimated.Text>
        </Reanimated.View>
      </Reanimated.View>
    </TouchableOpacity>
  );
};

export default function ContentTabs({
  activeTab,
  onTabPress,
}: ContentTabsProps) {
  const [tabLayouts, setTabLayouts] = useState<
    Record<TabName, { x: number; width: number } | null>
  >({
    note: null,
    transcript: null,
    summary: null,
    flashcard: null,
    quizzes: null,
  });
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to update layout state when a tab renders/changes layout
  const handleLayout = (event: LayoutChangeEvent, name: TabName) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [name]: { x, width } }));
  };

  // Auto-scroll effect: runs when activeTab or tabLayouts change
  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (layout && scrollViewRef.current) {
      // Calculate the target scroll position to center the tab (adjust offset as needed)
      // Center calculation: tab's starting point (layout.x) - half the scrollview padding + half the tab width - half the screen/view width (approximated here as 100, adjust if needed)
      const scrollTargetX =
        layout.x -
        styles.scrollContent.paddingHorizontal +
        layout.width / 2 -
        100;

      // Scroll to the calculated position, ensuring it doesn't go below 0
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollTargetX),
        animated: true,
      });
    }
  }, [activeTab, tabLayouts]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
      >
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.name;
          return (
            <TabItem
              key={tab.name}
              tabData={tab}
              isActive={isActive}
              onPress={() => onTabPress(tab.name)}
              onLayout={(event) => handleLayout(event, tab.name)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
