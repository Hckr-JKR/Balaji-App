import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { auth, onAuthStateChanged, getUserData } from "@/lib/firebase";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  roomNumber: string | null;
  preferredLanguage: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  setUserData: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  setUserData: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDataFromFirestore = await getUserData(currentUser.uid);
          if (userDataFromFirestore) {
            setUserData(userDataFromFirestore as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
