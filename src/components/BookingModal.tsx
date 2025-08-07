import { useState } from 'react';
import { ParkingSlot, Booking } from '@/types/parking';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, User, Hash, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  onConfirmBooking: (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>) => void;
  onReportIssue: (slot: ParkingSlot) => void;
}

export const BookingModal = ({ isOpen, onClose, slot, onConfirmBooking, onReportIssue }: BookingModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !vehicleNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!slot) return;

    onConfirmBooking({
      slotId: slot.id,
      customerName: customerName.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
    });

    toast({
      title: "Booking Confirmed",
      description: `Slot ${slot.number} has been reserved successfully.`,
      variant: "default",
    });

    setCustomerName('');
    setVehicleNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="enterprise-card border-card-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Car className="w-5 h-5" />
            Reserve Parking Slot
          </DialogTitle>
          <DialogDescription>
            Reserve a parking slot by providing your details below.
          </DialogDescription>
        </DialogHeader>

        {slot && (
          <div className="space-y-6">
            <div className="p-4 bg-secondary/20 rounded-lg border border-card-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Selected Slot</span>
                <span className="text-xl font-bold text-primary">{slot.number}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="status-indicator status-available" />
                <span className="text-success font-medium">Available</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="enterprise-card"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Vehicle Number
                </Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="ABC1234"
                  className="enterprise-card uppercase"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => slot && onReportIssue(slot)}
                  className="flex-shrink-0 border-warning hover:bg-warning/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
                <div className="flex gap-2 flex-1">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="default"
                    className="flex-1 glow-primary"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};