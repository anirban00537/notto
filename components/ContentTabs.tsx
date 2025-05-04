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
      const tabIndex = TABS.findIndex((tab) => tab.name === activeTab);
      contentScrollViewRef.current.scrollTo({
        x: tabIndex * SCREEN_WIDTH,
        animated: true,
      });
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
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);

    if (page >= 0 && page < TABS.length) {
      const newActiveTab = TABS[page].name;
      if (newActiveTab !== activeTab && onSwipeChange) {
        onSwipeChange(newActiveTab);
      }
    }
  };

  const handleTabPress = (tab: TabName) => {
    onTabPress(tab);
    // Scroll content to the corresponding tab
    if (contentScrollViewRef.current) {
      const tabIndex = TABS.findIndex((t) => t.name === tab);
      contentScrollViewRef.current.scrollTo({
        x: tabIndex * SCREEN_WIDTH,
        animated: true,
      });
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
            {TABS.map((tab, idx) => (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, activeTab === tab.name && styles.activeTab]}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.8}
                onLayout={(e) => onTabLayout(idx, e)}
              >
                <View style={styles.tabContent}>
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.name ? "#fff" : "#2c3e50"}
                    style={styles.tabIcon}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.name && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f7fa",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    borderRadius: 6,
    marginHorizontal: 2,
    minWidth: 84,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#2c3e50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabIcon: {
    marginRight: 4,
    opacity: 0.9,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
  },
});
