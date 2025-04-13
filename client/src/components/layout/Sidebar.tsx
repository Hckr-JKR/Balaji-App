import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileMenuOpen: boolean;
}

const Sidebar = ({ mobileMenuOpen }: SidebarProps) => {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLocation("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { path: "/", icon: "dashboard", label: t('dashboard') },
    { path: "/rooms", icon: "meeting_room", label: t('rooms') },
    { path: "/payments", icon: "payments", label: t('payments') },
    { path: "/expenses", icon: "receipt_long", label: t('expenses') },
    { path: "/reports", icon: "bar_chart", label: t('reports') },
    { path: "/settings", icon: "settings", label: t('settings') }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 pt-16 pb-16 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out z-20",
        {
          "translate-x-0": mobileMenuOpen,
          "-translate-x-full": !mobileMenuOpen,
          "lg:translate-x-0": true
        }
      )}
    >
      <div className="h-full flex flex-col justify-between py-4">
        <div>
          {/* User profile section */}
          <div className="px-4 py-2 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center">
                <span className="material-icons text-primary-600 dark:text-primary-300">person</span>
              </div>
              <div>
                <div className="font-medium">{user?.displayName || t('user')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-300 rounded px-2 py-0.5">
                    {userData?.role === "admin" ? t('admin') : t('resident')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(item.path);
                }}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md",
                  isActive(item.path)
                    ? "bg-primary-50 dark:bg-primary-700/20 text-primary-700 dark:text-primary-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <span className="material-icons text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
        
        {/* Logout button */}
        <div className="px-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
            onClick={handleLogout}
          >
            <span className="material-icons text-sm">logout</span>
            <span>{t('logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
