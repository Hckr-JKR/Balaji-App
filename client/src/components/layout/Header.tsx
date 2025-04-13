import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Header = ({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 w-full z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="material-icons text-primary-600 dark:text-primary-500">apartment</span>
            <h1 className="text-lg font-semibold">{t('appName')}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
