import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getAllExpenses } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Expenses = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: getAllExpenses,
    enabled: isAdmin
  });

  // Filter expenses
  const filteredExpenses = expenses?.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();
    
    const searchMatch = 
      expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const categoryMatch = selectedCategory === "all" || expense.category === selectedCategory;
    const monthMatch = selectedMonth === -1 || expenseMonth === selectedMonth;
    const yearMatch = selectedYear === -1 || expenseYear === selectedYear;
    
    return searchMatch && categoryMatch && monthMatch && yearMatch;
  });

  // Get expense categories
  const categories = [
    { value: "electricity", label: t('electricity') },
    { value: "water", label: t('water') },
    { value: "maintenance", label: t('maintenance') },
    { value: "security", label: t('security') },
    { value: "cleaning", label: t('cleaning') },
    { value: "repairs", label: t('repairs') },
    { value: "others", label: t('others') }
  ];

  // Get months for filtering
  const months = [
    { value: 0, label: t('january') },
    { value: 1, label: t('february') },
    { value: 2, label: t('march') },
    { value: 3, label: t('april') },
    { value: 4, label: t('may') },
    { value: 5, label: t('june') },
    { value: 6, label: t('july') },
    { value: 7, label: t('august') },
    { value: 8, label: t('september') },
    { value: 9, label: t('october') },
    { value: 10, label: t('november') },
    { value: 11, label: t('december') }
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Navigate to add expense page
  const handleAddExpense = () => {
    setLocation("/add-expense");
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
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
  };

  // Get category color class
  const getCategoryColorClass = (category: string) => {
    switch (category?.toLowerCase()) {
      case "electricity":
        return "bg-blue-100 text-blue-600";
      case "water":
        return "bg-green-100 text-green-600";
      case "cleaning":
        return "bg-purple-100 text-purple-600";
      case "security":
        return "bg-red-100 text-red-600";
      case "maintenance":
        return "bg-yellow-100 text-yellow-600";
      case "repairs":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('expenses')}</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Check if user is authorized to view expenses
  if (!isAdmin) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('expenses')}</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">lock</span>
            <p className="text-gray-500 dark:text-gray-400">{t('expensesAdminOnly')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t('expenses')}</h2>
        
        <Button onClick={handleAddExpense} className="mt-2 md:mt-0">
          <span className="material-icons mr-1">add</span>
          {t('addExpense')}
        </Button>
      </div>
      
      {/* Search and filter section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <Input
            placeholder={t('searchExpenses')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="md:col-span-1">
          <Button variant="outline" className="w-full">
            <span className="material-icons mr-2">download</span>
            {t('exportExpenses')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectMonth')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">{t('allMonths')}</SelectItem>
            {months.map(month => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectYear')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">{t('allYears')}</SelectItem>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Expenses list */}
      <div className="space-y-4">
        {filteredExpenses && filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <Card key={expense.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
                  <div className="flex items-center space-x-3 mb-3 md:mb-0">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getCategoryColorClass(expense.category)}`}>
                      <span className="material-icons text-sm">{getCategoryIcon(expense.category)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                        <Badge variant="outline">
                          {categories.find(c => c.value === expense.category)?.label || expense.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-lg">₹{expense.amount?.toLocaleString()}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(expense.createdAt || expense.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {expense.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm">{expense.description}</p>
                  </div>
                )}
                
                {expense.receiptURL && (
                  <div className="mt-2">
                    <Button variant="link" size="sm" className="p-0" onClick={() => window.open(expense.receiptURL, "_blank")}>
                      <span className="material-icons text-sm mr-1">receipt</span>
                      {t('viewReceipt')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <span className="material-icons text-4xl text-gray-400 mb-2">receipt_long</span>
              <p className="text-gray-500 dark:text-gray-400">{t('noExpensesFound')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Expenses;
