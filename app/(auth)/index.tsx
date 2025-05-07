import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../../constants/Typography";
import { useUser } from "../context/UserContext";

GoogleSignin.configure({
  webClientId:
    "76560488756-faqq3rpb2t6v5rj0q827un1kvv9cunmo.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  console.log("Auth screen rendered");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function onGoogleButtonPress() {
    try {
      console.log("Starting Google sign-in flow");
      setLoading(true);
      setError(null);

      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const googleSignInResult = await GoogleSignin.signIn();
      console.log("Google Sign-in successful, getting credential");
      const googleCredential = auth.GoogleAuthProvider.credential(
        googleSignInResult.data?.idToken ?? null
      );
      await auth().signInWithCredential(googleCredential);
      console.log("Firebase auth successful");
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else if (error.code === "auth/user-disabled") {
        setError("This account has been disabled.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="notebook" size={64} color="#000000" />
        </View>

        <Text style={[Typography.h1, styles.title]}>Welcome to Notto</Text>
        <Text style={[Typography.body1, styles.subtitle]}>
          Capture your thoughts, seamlessly
        </Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={onGoogleButtonPress}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="google"
                size={24}
                color="#fff"
                style={styles.googleIcon}
              />
              <Text style={[Typography.buttonText, styles.googleButtonText]}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <Animated.Text
            style={[Typography.body2, styles.errorText, { opacity: fadeAnim }]}
          >
            {error}
          </Animated.Text>
        )}

        <Text style={[Typography.caption, styles.termsText]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#666666",
    marginBottom: 48,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: Math.min(width - 48, 400),
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#ffffff",
  },
  errorText: {
    color: "#f44336",
    marginTop: 24,
    textAlign: "center",
    backgroundColor: "#ffebee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  termsText: {
    position: "absolute",
    bottom: 32,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
