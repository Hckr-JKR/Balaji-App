import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { t } = useTranslation();
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Get current language display name
  const getCurrentLanguageName = () => {
    const currentLang = availableLanguages.find(lang => lang.code === language);
    return currentLang ? currentLang.name : "English";
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-sm h-9 px-2"
          >
            <span className="material-icons text-sm">language</span>
            <span className="hidden sm:inline-block">{getCurrentLanguageName()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLanguages.map(lang => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`${language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : ''}`}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
