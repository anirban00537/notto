import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
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
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Scale pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shimmer effect
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const crownStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 1, 0.3]),
    };
  });

  return (
    <TouchableOpacity style={styles.premiumButton}>
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
      <MaterialCommunityIcons name="chevron-right" size={24} color="#2c3e50" />
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons
                    name="account"
                    size={40}
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
            <TouchableOpacity style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={20} color="#2c3e50" />
            </TouchableOpacity>
          </View>
        </View>

        <PremiumButton />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="account-cog"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Account Settings</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Notifications</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
              <MaterialCommunityIcons
                name="shield-account"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Privacy & Security</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="theme-light-dark"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Appearance</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="cloud-sync"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Backup & Sync</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color="#2c3e50"
              />
              <Text style={styles.menuText}>Help & Support</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e6f0ff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6f0ff",
    overflow: "hidden",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  joinedDate: {
    fontSize: 12,
    color: "#999",
  },
  editButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#f0f7ff",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e6f0ff",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 12,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6f0ff",
  },
  signOutText: {
    fontSize: 14,
    color: "#e74c3c",
    marginLeft: 8,
    fontWeight: "500",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6f0ff",
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
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
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
