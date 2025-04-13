import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Room {
  roomNumber: string;
  totalDue: number;
  residentName?: string;
}

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onPaymentComplete?: () => void;
}

const UPIPaymentModal = ({ 
  isOpen, 
  onClose, 
  room, 
  onPaymentComplete 
}: UPIPaymentModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // UPI ID - from admin settings or default
  const upiId = userData?.upiId || "balajiapt@upi";
  
  // Month and year for receipt reference
  const month = new Date().toLocaleString('default', { month: 'long' });
  const year = new Date().getFullYear();

  // Generate UPI payment link
  const getUpiPaymentLink = () => {
    const amount = room.totalDue.toString();
    const description = `Room ${room.roomNumber} - ${month} ${year}`;
    return `upi://pay?pa=${upiId}&pn=Balaji%20Apartment&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;
  };

  // Copy UPI ID to clipboard
  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Handle pay now button click
  const handlePayNow = () => {
    window.location.href = getUpiPaymentLink();
    
    // Show toast notification
    toast({
      title: t('paymentInitiated'),
      description: t('paymentInitiatedDesc'),
    });
    
    if (onPaymentComplete) {
      onPaymentComplete();
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('payMaintenanceFee')}</DialogTitle>
          <DialogDescription>
            {t('scanQrToPay')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-2 rounded-lg mb-4">
            {/* QR Code - Using a QR library would be better, but for now showing a placeholder */}
            <div className="w-48 h-48 border border-gray-200 flex items-center justify-center bg-white">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <rect width="200" height="200" fill="white" />
                <rect x="40" y="40" width="120" height="120" fill="#6366F1" fillOpacity="0.1" />
                <path
                  d="M90 90H110V110H90V90ZM50 50H70V70H50V50ZM50 90H70V110H50V90ZM50 130H70V150H50V130ZM90 50H110V70H90V50ZM90 130H110V150H90V130ZM130 50H150V70H130V50ZM130 90H150V110H130V90ZM130 130H150V150H130V130Z"
                  fill="#6366F1"
                />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="font-medium text-lg">₹{room.totalDue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {t('room')} {room.roomNumber} - {month} {year}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('orPayUsingUpiId')}</p>
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md p-2">
            <span className="text-sm">{upiId}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyUpiId}
              className="text-primary-600 dark:text-primary-400 text-sm h-auto py-1"
            >
              {copied ? t('copied') : t('copy')}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="sm:mr-2 w-full sm:w-auto">
            {t('cancel')}
          </Button>
          <Button onClick={handlePayNow} className="w-full sm:w-auto">
            {t('payNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UPIPaymentModal;
