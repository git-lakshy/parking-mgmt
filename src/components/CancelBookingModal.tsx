import { useState } from 'react';
import { Booking } from '@/types/parking';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Search, User, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

export const CancelBookingModal = ({ 
  isOpen, 
  onClose, 
  bookings, 
  onCancelBooking 
}: CancelBookingModalProps) => {
  const [searchByName, setSearchByName] = useState('');
  const [searchById, setSearchById] = useState('');
  const { toast } = useToast();

  const activeBookings = bookings.filter(b => b.status === 'active');

  const bookingsByName = activeBookings.filter(booking =>
    booking.customerName.toLowerCase().includes(searchByName.toLowerCase())
  );

  const bookingById = activeBookings.find(booking =>
    booking.id.toLowerCase().includes(searchById.toLowerCase())
  );

  const handleCancel = (booking: Booking) => {
    onCancelBooking(booking.id);
    toast({
      title: "Booking Cancelled",
      description: `Booking for ${booking.customerName} has been cancelled.`,
    });
    setSearchByName('');
    setSearchById('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="enterprise-card border-card-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <X className="w-5 h-5" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="by-name" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="by-name">Search by Name</TabsTrigger>
            <TabsTrigger value="by-id">Search by ID</TabsTrigger>
          </TabsList>

          <TabsContent value="by-name" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Name
              </Label>
              <Input
                id="searchName"
                value={searchByName}
                onChange={(e) => setSearchByName(e.target.value)}
                placeholder="Enter customer name..."
                className="enterprise-card"
              />
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchByName && bookingsByName.length > 0 ? (
                bookingsByName.map((booking) => (
                  <div key={booking.id} className="enterprise-card p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{booking.customerName}</span>
                        <Badge variant="secondary">{booking.vehicleNumber}</Badge>
                      </div>
                      <div className="text-sm text-foreground-secondary">
                        {new Date(booking.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {booking.id}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleCancel(booking)}
                    >
                      Cancel
                    </Button>
                  </div>
                ))
              ) : searchByName ? (
                <div className="text-center py-8 text-foreground-secondary">
                  No bookings found for "{searchByName}"
                </div>
              ) : (
                <div className="text-center py-8 text-foreground-secondary">
                  Enter a customer name to search
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="by-id" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchId" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Booking ID
              </Label>
              <Input
                id="searchId"
                value={searchById}
                onChange={(e) => setSearchById(e.target.value)}
                placeholder="Enter booking ID..."
                className="enterprise-card"
              />
            </div>

            {searchById && bookingById ? (
              <div className="enterprise-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{bookingById.customerName}</span>
                    <Badge variant="secondary">{bookingById.vehicleNumber}</Badge>
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {new Date(bookingById.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {bookingById.id}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleCancel(bookingById)}
                >
                  Cancel
                </Button>
              </div>
            ) : searchById ? (
              <div className="text-center py-8 text-foreground-secondary">
                No booking found with ID "{searchById}"
              </div>
            ) : (
              <div className="text-center py-8 text-foreground-secondary">
                Enter a booking ID to search
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};