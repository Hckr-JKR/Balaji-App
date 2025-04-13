import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavigation from "@/components/layout/MobileNavigation";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Rooms from "@/pages/Rooms";
import Payments from "@/pages/Payments";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import RoomDetail from "@/pages/RoomDetail";
import AddExpense from "@/pages/AddExpense";
import { useAuth } from "@/context/AuthContext";

function App() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route is login page
  const isLoginPage = location === "/login";

  // Effect to close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, show login
  if (!user && !isLoginPage) {
    return <Login />;
  }

  // If logged in and on login page, redirect to dashboard
  if (user && isLoginPage) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {user && <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      
      <div className="flex flex-grow pt-16">
        {user && <Sidebar mobileMenuOpen={mobileMenuOpen} />}
        
        <main className={`w-full ${user ? 'lg:ml-64' : ''} px-4 py-6 mb-16 lg:mb-0`}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/room/:id" component={RoomDetail} />
            <Route path="/payments" component={Payments} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/add-expense" component={AddExpense} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      
      {user && <MobileNavigation />}
      <Toaster />
    </div>
  );
}

export default App;
