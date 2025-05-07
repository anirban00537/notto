import React, { createContext, useContext, useState, useEffect } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface UserContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

// Define the component first as a separate const
const UserProviderComponent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("USER CONTEXT: Setting up auth state listener");
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log(
        "USER CONTEXT: Auth state changed:",
        user ? `User authenticated (${user.email})` : "No user (signed out)"
      );

      if (user) {
        // User is signed in
        console.log("USER CONTEXT: User ID:", user.uid);
        console.log("USER CONTEXT: User email:", user.email);
      } else {
        // User is signed out
        console.log("USER CONTEXT: Setting user to null");
      }

      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log("USER CONTEXT: Cleaning up auth state listener");
      subscriber();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the hook as a named export
export const useUser = () => {
  const context = useContext(UserContext);
  console.log(
    "USER CONTEXT: useUser hook called, user:",
    context.user ? `exists (${context.user.email})` : "null",
    "loading:",
    context.loading
  );
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Export the provider both ways for backward compatibility
export const UserProvider = UserProviderComponent;

// This is the default export
export default UserProviderComponent;
