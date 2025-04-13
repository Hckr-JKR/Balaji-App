import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Expense {
  id: string;
  title: string;
  date: string;
  amount: number;
  category: string;
  icon: string;
}

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses = ({ expenses }: RecentExpensesProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleViewAll = () => {
    setLocation("/expenses");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <CardTitle>{t('recentExpenses')}</CardTitle>
        <Button variant="link" size="sm" onClick={handleViewAll}>
          {t('viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <li key={expense.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="material-icons text-sm text-blue-600">{expense.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{expense.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">₹{expense.amount.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="material-icons text-4xl text-gray-300 mb-2">receipt_long</span>
            <p className="text-gray-500 dark:text-gray-400">{t('noRecentExpenses')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpenses;
