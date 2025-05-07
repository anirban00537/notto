import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { UserProvider, useUser } from "./context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import auth from "@react-native-firebase/auth";
import { setAuthToken } from "../lib/services";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/useColorScheme";
import { FONTS } from "@/constants/Typography";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        if (user) {
          const token = await user.getIdToken(true);
          await setAuthToken(token);
        } else {
          await setAuthToken(null);
        }
        setIsTokenSet(true);
      } catch (error) {
        console.error("Error setting up auth:", error);
        setIsTokenSet(true); // Still set to true to prevent infinite loading
      }
    };

    setupAuth();

    // Set up token refresh listener
    const unsubscribe = auth().onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        await setAuthToken(token);
      } else {
        await setAuthToken(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!isTokenSet) {
    return null;
  }

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    [FONTS.regular]: require("../assets/fonts/Inter/Inter-Regular.ttf"),
    [FONTS.medium]: require("../assets/fonts/Inter/Inter-Medium.ttf"),
    [FONTS.semiBold]: require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
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
          <AuthLayout>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#f0f7ff" },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="note/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: false,
                  presentation: "modal",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthLayout>
        </UserProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
