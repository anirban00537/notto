import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../../lib/services/request";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { Typography, FONTS } from "../../constants/Typography";
import { Colors } from "../../constants/Colors";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PremiumButton = () => {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const buttonBg = useSharedValue(0);

  // Animation setup
  const startAnimations = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    buttonBg.value = withTiming(1, { duration: 300 });
  };

  const resetAnimations = () => {
    buttonBg.value = withTiming(0, { duration: 200 });
  };

  // Continuous shimmer animation
  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const crownStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      buttonBg.value,
      [0, 1],
      [Colors.light.tintBackground, Colors.light.tintLight]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bgColor,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.6, 1, 0.6]),
  }));

  const buttonStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      buttonBg.value,
      [0, 1],
      [Colors.light.background, Colors.light.tintBackground]
    );

    return {
      backgroundColor: bgColor,
      borderColor: Colors.light.tintLight,
    };
  });

  return (
    <Animated.View style={[styles.premiumButton, buttonStyle]}>
      <TouchableOpacity
        style={styles.premiumTouchable}
        activeOpacity={0.9}
        onPressIn={startAnimations}
        onPressOut={resetAnimations}
      >
        <View style={styles.premiumContent}>
          <Animated.View style={[styles.crownContainer, crownStyle]}>
            <AnimatedIcon
              name="crown"
              size={24}
              color={Colors.light.tint}
              style={shimmerStyle}
            />
          </Animated.View>
          <View style={styles.premiumTextContainer}>
            <Text style={[Typography.body1, styles.premiumTitle]}>
              Upgrade to Premium
            </Text>
            <Text style={[Typography.caption, styles.premiumSubtitle]}>
              Unlock all features
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors.light.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      console.log("SIGN OUT: Starting sign out process");

      // Clear the authentication token from storage and memory
      await setAuthToken(null);
      console.log("SIGN OUT: Auth token cleared");

      // Clear any other app state storage
      try {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
        console.log("SIGN OUT: AsyncStorage cleared");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }

      // Sign out from Firebase
      await auth().signOut();
      console.log("SIGN OUT: Firebase sign out complete");

      // Force immediate navigation to auth screen
      // This direct approach bypasses the normal routing flow and forces the redirect
      router.replace("/(auth)");
    } catch (error) {
      console.error("SIGN OUT: Error during sign out process:", error);
      // As a fallback, try to force navigation to auth
      router.replace("/(auth)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>
        <Text style={[Typography.h4, styles.headerTitle]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons
                    name="account"
                    size={32}
                    color="#fff"
                  />
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={[Typography.h4, styles.name]}>
                {user?.displayName || "User"}
              </Text>
              <Text style={[Typography.body2, styles.email]}>
                {user?.email}
              </Text>
              <Text style={[Typography.caption, styles.joinedDate]}>
                Joined {user?.metadata.creationTime?.split("T")[0]}
              </Text>
            </View>
          </View>
        </View>

        <PremiumButton />

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#e74c3c" />
          <Text style={[Typography.body1, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    marginTop: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  name: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    color: Colors.light.secondaryText,
    marginBottom: 4,
  },
  joinedDate: {
    color: Colors.light.tertiaryText,
  },
  premiumButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  premiumTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  crownContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  premiumTextContainer: {
    marginLeft: 12,
  },
  premiumTitle: {
    color: Colors.light.text,
    fontFamily: FONTS.medium,
  },
  premiumSubtitle: {
    color: Colors.light.secondaryText,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: 16,
    marginTop: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffebeb",
  },
  signOutText: {
    color: Colors.light.deleteButton,
    marginLeft: 8,
  },
});
