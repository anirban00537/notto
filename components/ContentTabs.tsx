import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

type TabName = "note" | "transcript" | "summary" | "quiz" | "flashcards";

const TABS: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: "note", label: "Note", icon: "note-text-outline" },
  { name: "transcript", label: "Transcript", icon: "script-text-outline" },
  { name: "summary", label: "Summary", icon: "text-box-outline" },
  { name: "quiz", label: "Quiz", icon: "help-circle-outline" },
  { name: "flashcards", label: "Flashcards", icon: "card-text-outline" },
];

export type { TabName };
export { TABS };

interface ContentTabsProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
  children?: React.ReactNode;
  onSwipeChange?: (tab: TabName) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ContentTabs({
  activeTab,
  onTabPress,
  children,
  onSwipeChange,
}: ContentTabsProps) {
  const scrollRef = useRef<ScrollView>(null);
  const contentScrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    []
  );
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width
  );

  // Keep track of the last programmatic scroll to avoid feedback loops
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (tabLayouts.length !== TABS.length) return;
    const idx = TABS.findIndex((tab) => tab.name === activeTab);
    if (idx === -1) return;
    const { x, width } = tabLayouts[idx];

    // Auto-scroll to center active tab
    if (scrollRef.current) {
      const scrollTo = x + width / 2 - containerWidth / 2;
      scrollRef.current.scrollTo({ x: Math.max(scrollTo, 0), animated: true });
    }

    // Scroll content to the active tab
    if (contentScrollViewRef.current) {
      isScrollingRef.current = true;
      const tabIndex = TABS.findIndex((tab) => tab.name === activeTab);
      contentScrollViewRef.current.scrollTo({
        x: tabIndex * SCREEN_WIDTH,
        animated: true,
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500); // Reset after animation completes
    }
  }, [activeTab, tabLayouts, containerWidth]);

  const onTabLayout = (idx: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = [...prev];
      next[idx] = { x, width };
      return next;
    });
  };

  const handleScroll = (event: any) => {
    // Skip if the scroll was triggered programmatically
    if (isScrollingRef.current) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);

    if (page >= 0 && page < TABS.length) {
      const newActiveTab = TABS[page].name;
      if (newActiveTab !== activeTab) {
        if (onSwipeChange) {
          onSwipeChange(newActiveTab);
        } else {
          // If no onSwipeChange provided, call onTabPress instead
          onTabPress(newActiveTab);
        }
      }
    }
  };

  const handleTabPress = (tab: TabName) => {
    // First update the active tab via the callback
    onTabPress(tab);

    // Then scroll to the corresponding tab
    if (contentScrollViewRef.current) {
      isScrollingRef.current = true;
      const tabIndex = TABS.findIndex((t) => t.name === tab);
      contentScrollViewRef.current.scrollTo({
        x: tabIndex * SCREEN_WIDTH,
        animated: true,
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500); // Reset after animation completes
    }
  };

  return (
    <View style={styles.rootContainer}>
      <View
        style={styles.container}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          <View style={styles.tabsContainer}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => handleTabPress(tab.name)}
                  activeOpacity={0.6}
                  onLayout={(e) =>
                    onTabLayout(
                      TABS.findIndex((t) => t.name === tab.name),
                      e
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={24}
                    color={isActive ? "#000000" : "#757575"}
                    style={styles.tabIcon}
                  />
                  <Text
                    style={[
                      isActive
                        ? Typography.tabLabelActive
                        : Typography.tabLabel,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {children ? (
        <ScrollView
          ref={contentScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.contentContainer}
        >
          {React.Children.map(children, (child) => (
            <View style={[styles.tabPage, { width: SCREEN_WIDTH }]}>
              {child}
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.light.deepBackground,
    paddingTop: 4,
    paddingBottom: 0,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 2,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: Colors.light.tintBackground,
    elevation: 0,
  },
  tabIcon: {
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
  },
  indicator: {
    position: "absolute",
    height: 3,
    backgroundColor: "#111",
    bottom: 0,
    borderRadius: 2,
  },
});
