import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getAllRooms } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UPIPaymentModal from "@/components/payment/UPIPaymentModal";

const Rooms = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const isAdmin = userData?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch rooms data
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getAllRooms
  });

  // Filter rooms based on search term
  const filteredRooms = rooms?.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(searchLower) ||
      room.residentName?.toLowerCase().includes(searchLower)
    );
  });

  // Handle room click
  const handleRoomClick = (room: any) => {
    if (isAdmin) {
      setLocation(`/room/${room.roomNumber}`);
    } else if (userData?.roomNumber === room.roomNumber) {
      setLocation(`/room/${room.roomNumber}`);
    }
  };

  // Handle pay button click
  const handlePayClick = (room: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setShowPaymentModal(true);
  };

  // Get status badge
  const getStatusBadge = (room: any) => {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('rooms')}</h2>
        <div className="mb-4">
          <Input
            className="w-full"
            placeholder={t('searchRoom')}
            disabled
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-3"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
              <div className="flex justify-between">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No rooms found
  if (!rooms || rooms.length === 0) {
    return (
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-6">{t('rooms')}</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">meeting_room</span>
            <p className="text-gray-500 dark:text-gray-400">{t('noRoomsFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold mb-6">{t('rooms')}</h2>
      
      {/* Search input */}
      <div className="mb-4">
        <Input
          className="w-full"
          placeholder={t('searchRoom')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Rooms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms?.map((room) => (
          <Card 
            key={room.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleRoomClick(room)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>
                  {t('room')} {room.roomNumber}
                </span>
                {getStatusBadge(room)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-1">
                <span className="font-medium">{t('resident')}:</span> {room.residentName || t('vacant')}
              </p>
              {room.totalDue > 0 ? (
                <p className="mb-3">
                  <span className="font-medium">{t('amount')}:</span> ₹{room.totalDue.toLocaleString()}
                </p>
              ) : (
                <p className="mb-3">
                  <span className="font-medium">{t('monthlyFee')}:</span> ₹{room.monthlyFee?.toLocaleString() || 1500}
                </p>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-between mt-2">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoomClick(room);
                  }}
                >
                  {t('viewDetails')}
                </Badge>
                
                {room.totalDue > 0 && (
                  <Badge 
                    variant="default" 
                    className="bg-primary-600 hover:bg-primary-700 cursor-pointer"
                    onClick={(e) => handlePayClick(room, e)}
                  >
                    {t('payNow')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
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
};

export default Rooms;
