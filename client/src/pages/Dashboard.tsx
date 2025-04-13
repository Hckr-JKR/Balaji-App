import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getAllRooms, getAllExpenses } from "@/lib/firebase";
import SummaryStats from "@/components/dashboard/SummaryStats";
import PendingPaymentsTable from "@/components/dashboard/PendingPaymentsTable";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import CollectionProgress from "@/components/dashboard/CollectionProgress";

const Dashboard = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";

  // Fetch rooms data
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRooms,
    enabled: isAdmin
  });

  // Fetch expenses data
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getAllExpenses,
    enabled: isAdmin
  });

  // Calculate summary stats
  const [summaryData, setSummaryData] = useState({
    totalCollected: 0,
    totalExpenses: 0,
    currentBalance: 0,
    pendingDues: 0,
    pendingRooms: 0
  });

  useEffect(() => {
    if (rooms && expenses) {
      // Calculate total collected
      const totalCollected = rooms.reduce((acc, room) => {
        const payments = room.payments || [];
        return acc + payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      }, 0);
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);
      
      // Calculate current balance
      const currentBalance = totalCollected - totalExpenses;
      
      // Calculate pending dues
      const pendingDues = rooms.reduce((acc, room) => {
        return acc + (room.totalDue || 0);
      }, 0);
      
      // Count rooms with pending dues
      const pendingRooms = rooms.filter(room => room.totalDue > 0).length;
      
      setSummaryData({
        totalCollected,
        totalExpenses,
        currentBalance,
        pendingDues,
        pendingRooms
      });
    }
  }, [rooms, expenses]);

  // Get pending payments
  const pendingPayments = rooms?.filter(room => room.totalDue > 0).map(room => ({
    roomNumber: room.roomNumber,
    resident: room.residentName,
    amount: room.totalDue,
    dueDate: room.dueDate,
    status: new Date(room.dueDate) < new Date() ? "overdue" : "pending"
  })) || [];

  // Get recent expenses
  const recentExpenses = expenses?.slice(0, 4).map(expense => ({
    id: expense.id,
    title: expense.title,
    date: expense.date,
    amount: expense.amount,
    category: expense.category,
    icon: getCategoryIcon(expense.category)
  })) || [];

  // Helper function to get category icon
  function getCategoryIcon(category: string) {
    switch (category?.toLowerCase()) {
      case "electricity":
        return "electrical_services";
      case "water":
        return "local_drink";
      case "cleaning":
        return "cleaning_services";
      case "security":
        return "security";
      case "maintenance":
        return "build";
      case "repairs":
        return "handyman";
      default:
        return "receipt";
    }
  }

  // Calculate collection progress
  const totalMonthlyDue = 60000; // Example value
  const collectedAmount = summaryData.totalCollected;
  const collectionPercentage = Math.min(100, Math.round((collectedAmount / totalMonthlyDue) * 100));

  if (roomsLoading || expensesLoading) {
    return (
      <div className="container mx-auto py-6">
        <h2 className="text-xl font-bold mb-6">{t('dashboard')}</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-6">{t('dashboard')}</h2>
      
      {/* Summary Stats */}
      <SummaryStats 
        totalCollected={summaryData.totalCollected}
        totalExpenses={summaryData.totalExpenses}
        currentBalance={summaryData.currentBalance}
        pendingDues={summaryData.pendingDues}
        pendingRooms={summaryData.pendingRooms}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Pending Payments Table */}
        <div className="lg:col-span-2">
          <PendingPaymentsTable payments={pendingPayments} />
        </div>
        
        {/* Recent Expenses */}
        <div>
          <RecentExpenses expenses={recentExpenses} />
        </div>
      </div>
      
      {/* Collection Progress */}
      <div className="mt-8">
        <CollectionProgress 
          collectedAmount={collectedAmount}
          totalAmount={totalMonthlyDue}
          percentage={collectionPercentage}
        />
      </div>
    </div>
  );
};

export default Dashboard;
