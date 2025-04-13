import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import { updateUserData } from "@/lib/firebase";

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  changeLanguage: () => {},
  availableLanguages: [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" }
  ]
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const { user, userData } = useAuth();
  const [language, setLanguage] = useState(i18n.language || "en");

  const availableLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" }
  ];

  // Initialize language from user preferences if available
  useEffect(() => {
    if (userData?.preferredLanguage) {
      changeLanguage(userData.preferredLanguage);
    }
  }, [userData]);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    
    // Save language preference to user profile if logged in
    if (user && userData) {
      try {
        await updateUserData(user.uid, { preferredLanguage: lang });
      } catch (error) {
        console.error("Error updating language preference:", error);
      }
    }
  };

  const value = {
    language,
    changeLanguage,
    availableLanguages
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
