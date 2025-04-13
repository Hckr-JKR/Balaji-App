import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getAllExpenses, getAllRooms } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  
  const [reportType, setReportType] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getAllExpenses,
    enabled: isAdmin
  });

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRooms,
    enabled: isAdmin
  });

  // Calculate monthly expense data
  const getMonthlyExpenseData = () => {
    if (!expenses) return [];
    
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      name: new Date(0, index).toLocaleString('default', { month: 'short' }),
      expenses: 0,
      income: 0
    }));
    
    // Process expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear().toString() === selectedYear) {
        const month = expenseDate.getMonth();
        monthlyData[month].expenses += expense.amount || 0;
      }
    });
    
    // Process income (payments)
    if (rooms) {
      rooms.forEach(room => {
        const payments = room.payments || [];
        payments.forEach((payment: any) => {
          const paymentDate = new Date(payment.date);
          if (paymentDate.getFullYear().toString() === selectedYear) {
            const month = paymentDate.getMonth();
            monthlyData[month].income += payment.amount || 0;
          }
        });
      });
    }
    
    return monthlyData;
  };

  // Calculate category expense data
  const getCategoryExpenseData = () => {
    if (!expenses) return [];
    
    const categoryMap: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear().toString() === selectedYear) {
        const category = expense.category || "Other";
        categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
      }
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  // Years for selection
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6666'];

  // Loading state
  if ((isAdmin && (expensesLoading || roomsLoading)) || (!isAdmin && !userData)) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('reports')}</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Check if user is authorized to view reports
  if (!isAdmin) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('reports')}</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">lock</span>
            <p className="text-gray-500 dark:text-gray-400">{t('reportsAdminOnly')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-6">{t('reports')}</h2>
      
      {/* Report controls */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <Tabs value={reportType} onValueChange={setReportType} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="monthly">{t('monthlyReport')}</TabsTrigger>
            <TabsTrigger value="category">{t('categoryReport')}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder={t('selectYear')} />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline">
          <span className="material-icons mr-2">download</span>
          {t('exportReport')}
        </Button>
      </div>
      
      {/* Report content */}
      <div className="space-y-6">
        {reportType === "monthly" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t('monthlyIncomeAndExpenses')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getMonthlyExpenseData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                      <Bar dataKey="income" fill="#4338ca" name={t('income')} />
                      <Bar dataKey="expenses" fill="#ef4444" name={t('expenses')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('totalIncome')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    ₹{getMonthlyExpenseData().reduce((sum, item) => sum + item.income, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('totalExpenses')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    ₹{getMonthlyExpenseData().reduce((sum, item) => sum + item.expenses, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('netBalance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    ₹{(
                      getMonthlyExpenseData().reduce((sum, item) => sum + item.income, 0) -
                      getMonthlyExpenseData().reduce((sum, item) => sum + item.expenses, 0)
                    ).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('expensesByCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryExpenseData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryExpenseData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Category breakdown */}
              <div className="mt-4">
                <h3 className="font-medium mb-2">{t('categoryBreakdown')}</h3>
                <div className="space-y-2">
                  {getCategoryExpenseData().map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <span>₹{category.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
