import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import UserProvider, { useUser } from "./context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import auth from "@react-native-firebase/auth";
import { setAuthToken } from "../lib/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "../components/LoadingScreen";
import { View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Root layout that sets up providers
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <RootLayoutNav />
        </UserProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// This component handles the authentication state and routing
function RootLayoutNav() {
  const { user, loading } = useUser();

  console.log(
    "ROOT LAYOUT NAV: user:",
    user ? "exists" : "null",
    "loading:",
    loading
  );

  // While we're checking if the user is logged in, show a loading screen
  if (loading) {
    console.log("ROOT LAYOUT: Loading auth state, showing LoadingScreen");
    return <LoadingScreen />;
  }

  // Return a slot that will render the correct route based on the auth state
  console.log(
    "ROOT LAYOUT: Setting up route structure, showing",
    user ? "(app)" : "(auth)"
  );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* If not authenticated, only the auth stack is accessible */}
      {!user ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        // If authenticated, only the main app stack is accessible
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      )}
      {/* Always render index for redirecting */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
