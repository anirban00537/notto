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
    console.log("Setting up auth state listener");
    const subscriber = auth().onAuthStateChanged((user) => {
      console.log(
        "Auth state changed:",
        user ? "User authenticated" : "No user"
      );
      setUser(user);
      setLoading(false);
    });

    return subscriber;
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the hook as a named export
export const useUser = () => useContext(UserContext);

// Export the provider both ways for backward compatibility
export const UserProvider = UserProviderComponent;

// This is the default export
export default UserProviderComponent;
