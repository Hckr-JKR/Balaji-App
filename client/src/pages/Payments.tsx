import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UPIPaymentModal from "@/components/payment/UPIPaymentModal";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Payments = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  const userRoomNumber = userData?.roomNumber;
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      let paymentsQuery;
      
      if (isAdmin) {
        // Admin can see all payments
        paymentsQuery = query(
          collection(db, "payments"),
          orderBy("createdAt", "desc")
        );
      } else {
        // Residents only see their room's payments
        paymentsQuery = query(
          collection(db, "payments"),
          where("roomNumber", "==", userRoomNumber),
          orderBy("createdAt", "desc")
        );
      }
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments = await Promise.all(
        paymentsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get receipt URL if available
          let receiptUrl = data.receiptURL;
          if (!receiptUrl && data.receiptPath) {
            try {
              receiptUrl = await getDownloadURL(ref(storage, data.receiptPath));
            } catch (error) {
              console.error("Error getting receipt URL:", error);
            }
          }
          
          return {
            id: doc.id,
            ...data,
            receiptUrl,
            date: data.date,
            createdAt: data.createdAt?.toDate() || new Date()
          };
        })
      );
      
      return payments;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  };

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments
  });

  // Filter payments
  const filteredPayments = payments?.filter(payment => {
    const paymentDate = new Date(payment.date);
    const paymentMonth = paymentDate.getMonth();
    const paymentYear = paymentDate.getFullYear();
    
    const monthMatch = selectedMonth === -1 || paymentMonth === selectedMonth;
    const yearMatch = selectedYear === -1 || paymentYear === selectedYear;
    
    if (viewMode === "pending") {
      return payment.status === "pending" && monthMatch && yearMatch;
    } else if (viewMode === "completed") {
      return payment.status === "completed" && monthMatch && yearMatch;
    }
    
    return monthMatch && yearMatch;
  });

  // Get available months and years for filtering
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

  // Handle pay now button click
  const handlePayNow = (room: any) => {
    setSelectedRoom(room);
    setShowPaymentModal(true);
  };

  // Handle view receipt
  const handleViewReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, "_blank");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('payments')}</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-6">{t('payments')}</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        
        <div>
          {isAdmin && (
            <Button variant="outline" className="w-full">
              <span className="material-icons mr-2">download</span>
              {t('exportPayments')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Payments tabs */}
      <Tabs defaultValue="all" onValueChange={setViewMode}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t('allPayments')}</TabsTrigger>
          <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
          <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {renderPaymentsList(filteredPayments)}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {renderPaymentsList(filteredPayments)}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {renderPaymentsList(filteredPayments)}
        </TabsContent>
      </Tabs>
      
      {/* UPI Payment Modal */}
      {selectedRoom && (
        <UPIPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          room={selectedRoom}
        />
      )}
    </div>
  );
  
  // Helper function to render payments list
  function renderPaymentsList(paymentsToRender: any[] | undefined) {
    if (!paymentsToRender || paymentsToRender.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">payments</span>
            <p className="text-gray-500 dark:text-gray-400">{t('noPaymentsFound')}</p>
          </CardContent>
        </Card>
      );
    }
    
    return paymentsToRender.map(payment => (
      <Card key={payment.id} className="overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {t('room')} {payment.roomNumber}
          </CardTitle>
          <Badge
            variant={payment.status === "completed" ? "outline" : "default"}
            className={payment.status === "completed" ? "bg-green-100 text-green-800" : ""}
          >
            {payment.status === "completed" ? t('completed') : t('pending')}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">{t('amount')}:</span> ₹{payment.amount?.toLocaleString()}</p>
              <p><span className="font-medium">{t('date')}:</span> {new Date(payment.date).toLocaleDateString()}</p>
              <p><span className="font-medium">{t('paymentMethod')}:</span> {payment.method || "UPI"}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex flex-col md:items-end justify-center gap-2">
              {payment.receiptUrl && (
                <Button variant="outline" size="sm" onClick={() => handleViewReceipt(payment.receiptUrl)}>
                  <span className="material-icons text-sm mr-1">description</span>
                  {t('viewReceipt')}
                </Button>
              )}
              
              {payment.status === "pending" && (
                <Button size="sm" onClick={() => handlePayNow({ roomNumber: payment.roomNumber, totalDue: payment.amount })}>
                  <span className="material-icons text-sm mr-1">payments</span>
                  {t('payNow')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }
};

export default Payments;
