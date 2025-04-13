import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  roomNumber: string;
  resident: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface PendingPaymentsTableProps {
  payments: Payment[];
}

const PendingPaymentsTable = ({ payments }: PendingPaymentsTableProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleViewAll = () => {
    setLocation("/payments");
  };

  const handleRoomClick = (roomNumber: string) => {
    setLocation(`/room/${roomNumber}`);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <CardTitle>{t('pendingPayments')}</CardTitle>
        <Button variant="link" size="sm" onClick={handleViewAll}>
          {t('viewAll')}
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('room')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('resident')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dueDate')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    onClick={() => handleRoomClick(payment.roomNumber)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium">{payment.roomNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">{payment.resident}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">₹{payment.amount.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm ${payment.status === 'overdue' ? 'text-red-600' : ''}`}>
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={payment.status === 'overdue' ? 'destructive' : 'outline'}
                        className={payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      >
                        {payment.status === 'overdue' ? t('overdue') : t('pending')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="material-icons text-4xl text-gray-300 mb-2">check_circle</span>
            <p className="text-gray-500 dark:text-gray-400">{t('noPaymentsDue')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingPaymentsTable;
