import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, storage, recordPayment } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import UPIPaymentModal from "@/components/payment/UPIPaymentModal";
import { format } from "date-fns";

const RoomDetail = ({ params }: { params: { id: string } }) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  const roomNumber = params.id;
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("1500");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentNotes, setPaymentNotes] = useState("");

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      const roomsQuery = query(
        collection(db, "rooms"),
        where("roomNumber", "==", roomNumber)
      );
      const roomSnapshot = await getDocs(roomsQuery);
      
      if (roomSnapshot.empty) {
        throw new Error("Room not found");
      }
      
      const roomData = {
        id: roomSnapshot.docs[0].id,
        ...roomSnapshot.docs[0].data()
      };
      
      // If room has a residentId, fetch resident data
      if (roomData.residentId) {
        const residentDoc = await getDoc(doc(db, "users", roomData.residentId));
        if (residentDoc.exists()) {
          roomData.resident = {
            id: residentDoc.id,
            ...residentDoc.data()
          };
        }
      }
      
      return roomData;
    } catch (error) {
      console.error("Error fetching room data:", error);
      throw error;
    }
  };

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["room", roomNumber],
    queryFn: fetchRoomData
  });

  // Check authorization (admin or resident of this room)
  const isAuthorized = isAdmin || userData?.roomNumber === roomNumber;

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (formData: any) => {
      const paymentData = {
        roomNumber,
        amount: parseFloat(formData.amount),
        method: formData.method,
        date: formData.date,
        notes: formData.notes,
        status: formData.method === "UPI" ? "pending" : "completed",
        createdBy: userData?.id,
        createdAt: new Date()
      };
      
      return await recordPayment(paymentData, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomNumber] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      toast({
        title: t('paymentRecorded'),
        description: t('paymentRecordedDesc')
      });
      
      // Reset form
      setPaymentAmount("1500");
      setPaymentMethod("UPI");
      setPaymentDate(format(new Date(), "yyyy-MM-dd"));
      setPaymentNotes("");
    },
    onError: (error) => {
      toast({
        title: t('paymentFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle payment submission
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "UPI") {
      setShowPaymentModal(true);
      return;
    }
    
    recordPaymentMutation.mutate({
      amount: paymentAmount,
      method: paymentMethod,
      date: paymentDate,
      notes: paymentNotes
    });
  };

  // Handle go back
  const handleGoBack = () => {
    setLocation("/rooms");
  };

  // If not authorized
  if (!isLoading && !isAuthorized) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-xl font-bold">{t('room')} {roomNumber}</h2>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">lock</span>
            <p className="text-gray-500 dark:text-gray-400">{t('notAuthorizedRoom')}</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              {t('goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" disabled className="mr-2">
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-xl font-bold">{t('room')} {roomNumber}</h2>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !room) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-xl font-bold">{t('room')} {roomNumber}</h2>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-red-500 mb-2">error</span>
            <p className="text-gray-500 dark:text-gray-400">{t('roomNotFound')}</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              {t('goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get payment status badge
  const getStatusBadge = () => {
    if (!room.totalDue) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {t('paid')}
        </Badge>
      );
    }
    
    if (new Date(room.dueDate) < new Date()) {
      return (
        <Badge variant="destructive">
          {t('overdue')}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        {t('pending')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
          <span className="material-icons">arrow_back</span>
        </Button>
        <h2 className="text-xl font-bold">{t('room')} {roomNumber}</h2>
      </div>
      
      {/* Room Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('resident')}</h3>
              <p className="font-medium">{room.residentName || t('vacant')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('contact')}</h3>
              <p className="font-medium">{room.resident?.phoneNumber || room.contactNumber || t('notAvailable')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('monthlyFee')}</h3>
              <p className="font-medium">₹{room.monthlyFee?.toLocaleString() || "1,500"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('paymentStatus')}</h3>
              {getStatusBadge()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment History Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('paymentHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          {room.payments && room.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amount')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('paymentMethod')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('receipt')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {room.payments.map((payment: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        ₹{payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {payment.method || "UPI"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {payment.receiptURL ? (
                          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => window.open(payment.receiptURL, "_blank")}>
                            <span className="material-icons text-sm mr-1">description</span>
                            {t('view')}
                          </Button>
                        ) : (
                          <span className="text-gray-400">{t('notAvailable')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">{t('noPaymentHistory')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Record Payment Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recordPayment')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPayment}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="amount">{t('amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="payment-method">{t('paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder={t('selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">{t('cash')}</SelectItem>
                    <SelectItem value="Bank Transfer">{t('bankTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment-date">{t('paymentDate')}</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="notes">{t('notesOptional')}</Label>
                <Textarea
                  id="notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              {paymentMethod === "UPI" && (
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(true)}>
                  <span className="material-icons text-sm mr-1">qr_code_2</span>
                  {t('generateUpiQr')}
                </Button>
              )}
              
              <Button 
                type="submit" 
                className="bg-success-500 hover:bg-success-600 text-white"
                disabled={recordPaymentMutation.isPending}
              >
                {recordPaymentMutation.isPending ? t('recording') : t('recordPayment')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        room={{
          roomNumber,
          totalDue: parseFloat(paymentAmount),
          residentName: room.residentName
        }}
        onPaymentComplete={() => {
          recordPaymentMutation.mutate({
            amount: paymentAmount,
            method: "UPI",
            date: paymentDate,
            notes: paymentNotes
          });
        }}
      />
    </div>
  );
};

export default RoomDetail;
