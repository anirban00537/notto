import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";
import { Colors } from "@/constants/Colors";

type TabName = "note" | "transcript" | "summary";

const TABS: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: "note", label: "Note", icon: "note-text-outline" },
  { name: "summary", label: "Summary", icon: "text-box-outline" },
  { name: "transcript", label: "Transcript", icon: "script-text-outline" },
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
  const contentScrollViewRef = useRef<ScrollView>(null);

  // Keep track of the last programmatic scroll to avoid feedback loops
  const isScrollingRef = useRef(false);

  useEffect(() => {
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
  }, [activeTab]);

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
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={22}
                  color={
                    isActive ? Colors.light.text : Colors.light.secondaryText
                  }
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabText,
                    isActive ? styles.activeTabText : styles.inactiveTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
          {React.Children.map(children, (child, index) => (
            <View style={[styles.tabPage, { width: SCREEN_WIDTH }]}>
              {index < 3 && child}
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
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  activeTabText: {
    color: Colors.light.text,
  },
  inactiveTabText: {
    color: Colors.light.secondaryText,
  },
  contentContainer: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
  },
});
