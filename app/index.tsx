import { Redirect } from "expo-router";
import { useUser } from "./context/UserContext";
import LoadingScreen from "../components/LoadingScreen";
import { useEffect } from "react";
import auth from "@react-native-firebase/auth";

export default function Index() {
  const { user, loading } = useUser();

  // Add additional debugging
  useEffect(() => {
    console.log("ROOT INDEX (EFFECT): Current auth state:", {
      userExists: !!user,
      loading,
      userEmail: user?.email || "none",
      userAuthenticated: user?.uid ? true : false,
    });

    // Force sign out if there's any inconsistency in auth state
    const checkAuthState = async () => {
      try {
        // Get the current Firebase auth state directly
        const currentUser = auth().currentUser;

        // If our context says we have a user but Firebase says no,
        // or vice versa, we have an inconsistent state
        if (!!user !== !!currentUser) {
          console.log("ROOT INDEX: Inconsistent auth state detected!");
          console.log("ROOT INDEX: Context user exists:", !!user);
          console.log(
            "ROOT INDEX: Firebase currentUser exists:",
            !!currentUser
          );

          // Force sign out to reset the state
          await auth().signOut();
          console.log("ROOT INDEX: Forced sign out to reset state");
        }
      } catch (error) {
        console.error("ROOT INDEX: Error checking auth state:", error);
      }
    };

    // Only run this check when not loading
    if (!loading) {
      checkAuthState();
    }
  }, [user, loading]);

  console.log(
    "ROOT INDEX: User state:",
    user ? "User exists" : "No user",
    "Loading:",
    loading
  );

  // While we're checking if the user is logged in, show a loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to the appropriate route group based on authentication state
  if (user) {
    console.log("ROOT INDEX: Redirecting to app route");
    return <Redirect href="/(app)" />;
  } else {
    console.log("ROOT INDEX: Redirecting to auth route");
    return <Redirect href="/(auth)" />;
  }
}
