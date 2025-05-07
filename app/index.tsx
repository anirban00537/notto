import { Redirect } from "expo-router";
import { useUser } from "./context/UserContext";
import LoadingScreen from "../components/LoadingScreen";

export default function Index() {
  const { user, loading } = useUser();

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
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
}
