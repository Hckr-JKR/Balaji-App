import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const MobileNavigation = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", icon: "dashboard", label: t('dashboard') },
    { path: "/rooms", icon: "meeting_room", label: t('rooms') },
    { path: "/payments", icon: "payments", label: t('payments') },
    { path: "/expenses", icon: "receipt_long", label: t('expenses') },
    { path: "/more", icon: "more_horiz", label: t('more') },
  ];

  const handleNavClick = (path: string) => {
    if (path === "/more") {
      // Show more options or toggle settings
      setLocation("/settings");
    } else {
      setLocation(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg lg:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(item.path);
            }}
            className={`flex flex-col items-center p-2 ${
              isActive(item.path)
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
