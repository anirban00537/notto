import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useUser } from "../context/UserContext";
import auth from "@react-native-firebase/auth";
import { setAuthToken } from "../../lib/services";

export default function AppLayout() {
  const { user } = useUser();

  // Set up token refresh listener
  useEffect(() => {
    const setupAuth = async () => {
      if (user) {
        const token = await user.getIdToken(true);
        await setAuthToken(token);
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

  return (
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
  );
}
