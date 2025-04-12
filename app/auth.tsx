import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { MaterialCommunityIcons } from "@expo/vector-icons";

GoogleSignin.configure({
  webClientId:
    "76560488756-faqq3rpb2t6v5rj0q827un1kvv9cunmo.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

const AuthComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogleButtonPress() {
    try {
      setLoading(true);
      setError(null);

      // Sign out from previous sessions
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const googleSignInResult = await GoogleSignin.signIn();

      // Sign in to Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(
        googleSignInResult.data?.idToken ?? null
      );
      await auth().signInWithCredential(googleCredential);
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
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Notto</Text>
        <Text style={styles.subtitle}>Your personal note-taking app</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={onGoogleButtonPress}
          disabled={loading}
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
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#f44336",
    marginTop: 20,
    textAlign: "center",
  },
});

export default AuthComponent;
