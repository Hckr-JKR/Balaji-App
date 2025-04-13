import { useTranslation } from "react-i18next";

interface SummaryStatsProps {
  totalCollected: number;
  totalExpenses: number;
  currentBalance: number;
  pendingDues: number;
  pendingRooms: number;
}

const SummaryStats = ({
  totalCollected,
  totalExpenses,
  currentBalance,
  pendingDues,
  pendingRooms
}: SummaryStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalCollected')}</h3>
          <span className="material-icons text-primary-500">account_balance_wallet</span>
        </div>
        <p className="text-2xl font-semibold">₹{totalCollected.toLocaleString()}</p>
        <p className="text-xs text-green-600 flex items-center mt-1">
          <span className="material-icons text-xs mr-1">arrow_upward</span>
          4.75% {t('fromLastMonth')}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalExpenses')}</h3>
          <span className="material-icons text-warning-500">receipt_long</span>
        </div>
        <p className="text-2xl font-semibold">₹{totalExpenses.toLocaleString()}</p>
        <p className="text-xs text-red-600 flex items-center mt-1">
          <span className="material-icons text-xs mr-1">arrow_upward</span>
          8.2% {t('fromLastMonth')}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('currentBalance')}</h3>
          <span className="material-icons text-success-500">savings</span>
        </div>
        <p className="text-2xl font-semibold">₹{currentBalance.toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('updatedAsOfToday')}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('pendingDues')}</h3>
          <span className="material-icons text-error-500">warning</span>
        </div>
        <p className="text-2xl font-semibold">₹{pendingDues.toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {pendingRooms} {t('roomsWithPendingDues')}
        </p>
      </div>
    </div>
  );
};

export default SummaryStats;
