import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserData } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, userData, setUserData } = useAuth();
  const { language, changeLanguage, availableLanguages } = useLanguage();
  
  const [name, setName] = useState(userData?.name || "");
  const [roomNumber, setRoomNumber] = useState(userData?.roomNumber || "");
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [upiId, setUpiId] = useState(userData?.upiId || "");
  const [notificationEnabled, setNotificationEnabled] = useState(userData?.notificationsEnabled || true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(document.documentElement.classList.contains("dark"));

  // Update profile
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const updates = {
        name,
        roomNumber,
        phoneNumber
      };
      
      await updateUserData(user.uid, updates);
      
      // Update local state
      setUserData({
        ...userData!,
        ...updates
      });
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdateSuccess')
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t('updateFailed'),
        description: t('errorUpdatingProfile'),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update payment settings
  const handleUpdatePaymentSettings = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const updates = {
        upiId
      };
      
      await updateUserData(user.uid, updates);
      
      // Update local state
      setUserData({
        ...userData!,
        ...updates
      });
      
      toast({
        title: t('settingsUpdated'),
        description: t('paymentSettingsUpdateSuccess')
      });
    } catch (error) {
      console.error("Error updating payment settings:", error);
      toast({
        title: t('updateFailed'),
        description: t('errorUpdatingSettings'),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle notifications
  const handleToggleNotifications = async () => {
    if (!user) return;
    
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    
    try {
      await updateUserData(user.uid, {
        notificationsEnabled: newValue
      });
      
      // Update local state
      setUserData({
        ...userData!,
        notificationsEnabled: newValue
      });
      
      toast({
        title: newValue ? t('notificationsEnabled') : t('notificationsDisabled'),
        description: newValue ? t('notificationsEnabledDesc') : t('notificationsDisabledDesc')
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotificationEnabled(!newValue); // Revert UI
      
      toast({
        title: t('updateFailed'),
        description: t('errorUpdatingSettings'),
        variant: "destructive"
      });
    }
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newValue = !darkModeEnabled;
    setDarkModeEnabled(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-6">{t('settings')}</h2>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="payment">{t('payment')}</TabsTrigger>
          <TabsTrigger value="app">{t('app')}</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileSettings')}</CardTitle>
              <CardDescription>{t('manageProfileInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500">{t('emailChangeNote')}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomNumber">{t('roomNumber')}</Label>
                <Input
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              
              <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                {isUpdating ? t('updating') : t('updateProfile')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentSettings')}</CardTitle>
              <CardDescription>{t('managePaymentInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upiId">{t('upiId')}</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
                <p className="text-xs text-gray-500">{t('upiIdNote')}</p>
              </div>
              
              {userData?.role === "admin" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceFee">{t('defaultMaintenanceFee')}</Label>
                    <Input
                      id="maintenanceFee"
                      type="number"
                      defaultValue="1500"
                    />
                    <p className="text-xs text-gray-500">{t('maintenanceFeeNote')}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">{t('defaultDueDate')}</Label>
                    <Input
                      id="dueDate"
                      type="number"
                      defaultValue="15"
                      min="1"
                      max="31"
                    />
                    <p className="text-xs text-gray-500">{t('dueDateNote')}</p>
                  </div>
                </>
              )}
              
              <Button onClick={handleUpdatePaymentSettings} disabled={isUpdating}>
                {isUpdating ? t('updating') : t('savePaymentSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* App Settings */}
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>{t('appSettings')}</CardTitle>
              <CardDescription>{t('manageAppPreferences')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">{t('language')}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableLanguages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "default" : "outline"}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode" className="text-base">{t('darkMode')}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('darkModeDesc')}</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={darkModeEnabled}
                  onCheckedChange={handleToggleDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">{t('notifications')}</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('notificationsDesc')}</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
