import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { loginWithEmail, loginWithGoogle, registerWithEmail } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageSelector from "@/components/common/LanguageSelector";

const Login = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await loginWithEmail(loginEmail, loginPassword);
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t('loginFailed'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await registerWithEmail(registerEmail, registerPassword, registerName);
      toast({
        title: t('registrationSuccessful'),
        description: t('accountCreated'),
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t('registrationFailed'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      setLocation("/");
    } catch (error: any) {
      toast({
        title: t('loginFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      
      <div className="flex items-center mb-8">
        <span className="material-icons text-primary-600 dark:text-primary-500 text-3xl mr-2">apartment</span>
        <h1 className="text-2xl font-bold">{t('appName')}</h1>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('welcome')}</CardTitle>
          <CardDescription>{t('loginOrRegister')}</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('login')}</TabsTrigger>
            <TabsTrigger value="register">{t('register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginWithEmail}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full mb-2" disabled={isSubmitting}>
                  {isSubmitting ? t('loggingIn') : t('login')}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  {t('continueWithGoogle')}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">{t('name')}</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('email')}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('password')}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full mb-2" disabled={isSubmitting}>
                  {isSubmitting ? t('registering') : t('register')}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  {t('continueWithGoogle')}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
