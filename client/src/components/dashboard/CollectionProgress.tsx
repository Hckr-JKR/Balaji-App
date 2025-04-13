import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CollectionProgressProps {
  collectedAmount: number;
  totalAmount: number;
  percentage: number;
}

const CollectionProgress = ({ 
  collectedAmount, 
  totalAmount, 
  percentage 
}: CollectionProgressProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{t('monthlyCollectionProgress')}</h3>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">₹{collectedAmount.toLocaleString()}</span> / ₹{totalAmount.toLocaleString()}
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{percentage}% {t('collected')}</span>
          <span>{100 - percentage}% {t('remaining')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionProgress;
