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
import { useUser } from "./context/UserContext";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const PremiumButton = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 1, 0.3]),
  }));

  return (
    <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8}>
      <View style={styles.premiumContent}>
        <Animated.View style={[styles.crownContainer, crownStyle]}>
          <AnimatedIcon
            name="crown"
            size={24}
            color="#FFD700"
            style={shimmerStyle}
          />
        </Animated.View>
        <View style={styles.premiumTextContainer}>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumSubtitle}>Unlock all features</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#2c3e50" />
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f7ff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
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
              <Text style={styles.name}>{user?.displayName || "User"}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.joinedDate}>
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
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f7ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f0f7ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6f0ff",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
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
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6f0ff",
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
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: "#999",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: "#FFF8E7",
    borderRadius: 20,
  },
  premiumTextContainer: {
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  premiumSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffebeb",
  },
  signOutText: {
    fontSize: 16,
    color: "#e74c3c",
    marginLeft: 8,
    fontWeight: "500",
  },
});
