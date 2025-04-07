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
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tab: {
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 150 });
  }, [isActive, progress]);

  const tabAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", "#111"]
    );
    return { backgroundColor };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(progress.value, [0, 1], ["#888", "#fff"]);
    return { color };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(progress.value, [0, 1], ["#888", "#fff"]);
    return { color };
  });

  const translateAnimatedStyle = useAnimatedStyle(() => {
    const translateY = withTiming(isActive ? -2 : 0, { duration: 100 });
    return { transform: [{ translateY }] };
  });

  return (
    <TouchableOpacity
      key={tabData.name}
      style={styles.tab}
      onPress={onPress}
      onLayout={onLayout}
      activeOpacity={0.7}
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<
    Record<TabName, { x: number; width: number } | null>
  >({
    note: null,
    transcript: null,
    summary: null,
    flashcard: null,
    quizzes: null,
  });

  const handleLayout = (event: LayoutChangeEvent, name: TabName) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [name]: { x, width } }));
  };

  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (layout && scrollViewRef.current) {
      const scrollTargetX =
        layout.x -
        styles.scrollContent.paddingHorizontal +
        layout.width / 2 -
        50;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollTargetX),
        animated: true,
      });
    }
  }, [activeTab, tabLayouts]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
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
