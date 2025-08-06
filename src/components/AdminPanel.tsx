import { useState } from 'react';
import { ParkingSlot, Booking } from '@/types/parking';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Car, 
  Users, 
  Clock,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ParkingSlot[];
  bookings: Booking[];
  onAddSlot: (slotNumber: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onResetSlots: () => void;
  onCancelBooking: (bookingId: string) => void;
}

export const AdminPanel = ({ 
  isOpen, 
  onClose, 
  slots, 
  bookings, 
  onAddSlot, 
  onRemoveSlot, 
  onResetSlots,
  onCancelBooking 
}: AdminPanelProps) => {
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleAddSlot = () => {
    if (!newSlotNumber.trim()) {
      toast({
        title: "Invalid Slot Number",
        description: "Please enter a valid slot number.",
        variant: "destructive",
      });
      return;
    }

    const exists = slots.some(slot => slot.number === newSlotNumber.trim());
    if (exists) {
      toast({
        title: "Slot Already Exists",
        description: "A slot with this number already exists.",
        variant: "destructive",
      });
      return;
    }

    onAddSlot(newSlotNumber.trim());
    setNewSlotNumber('');
    toast({
      title: "Slot Added",
      description: `Slot ${newSlotNumber} has been added successfully.`,
    });
  };

  const handleRemoveSlot = (slotId: string, slotNumber: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot?.status !== 'available') {
      toast({
        title: "Cannot Remove Slot",
        description: "Cannot remove occupied or reserved slots.",
        variant: "destructive",
      });
      return;
    }

    onRemoveSlot(slotId);
    toast({
      title: "Slot Removed",
      description: `Slot ${slotNumber} has been removed.`,
    });
  };

  const handleResetSlots = () => {
    onResetSlots();
    toast({
      title: "System Reset",
      description: "All slots have been reset to available status.",
    });
  };

  const filteredBookings = bookings.filter(booking => 
    booking.status === 'active' && (
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    occupied: slots.filter(s => s.status === 'occupied').length,
    reserved: slots.filter(s => s.status === 'reserved').length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="enterprise-card border-card-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Control Panel
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="slots">Manage Slots</TabsTrigger>
            <TabsTrigger value="bookings">Active Bookings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="enterprise-card p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-foreground-secondary">Total Slots</div>
              </div>
              <div className="enterprise-card p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.available}</div>
                <div className="text-sm text-foreground-secondary">Available</div>
              </div>
              <div className="enterprise-card p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.occupied}</div>
                <div className="text-sm text-foreground-secondary">Occupied</div>
              </div>
              <div className="enterprise-card p-4 text-center">
                <div className="text-2xl font-bold text-warning">{stats.reserved}</div>
                <div className="text-sm text-foreground-secondary">Reserved</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="slots" className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="newSlot">Add New Slot</Label>
                <Input
                  id="newSlot"
                  value={newSlotNumber}
                  onChange={(e) => setNewSlotNumber(e.target.value)}
                  placeholder="e.g., A1, B12, C05"
                  className="enterprise-card"
                />
              </div>
              <Button 
                onClick={handleAddSlot}
                className="mt-8 glow-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {slots.map((slot) => (
                <div key={slot.id} className="enterprise-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`status-indicator ${
                      slot.status === 'available' ? 'status-available' : 
                      slot.status === 'occupied' ? 'status-occupied' : 'status-reserved'
                    }`} />
                    <span className="font-medium">{slot.number}</span>
                    <Badge variant={slot.status === 'available' ? 'default' : 'destructive'}>
                      {slot.status}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleRemoveSlot(slot.id, slot.number)}
                    disabled={slot.status !== 'available'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, vehicle, or booking ID..."
                  className="enterprise-card pl-10"
                />
              </div>
              <div className="text-sm text-foreground-secondary">
                {filteredBookings.length} active bookings
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredBookings.map((booking) => {
                const slot = slots.find(s => s.id === booking.slotId);
                return (
                  <div key={booking.id} className="enterprise-card p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-primary" />
                        <span className="font-medium">{booking.customerName}</span>
                        <Badge variant="secondary">{slot?.number}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                        <span>{booking.vehicleNumber}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {booking.id}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onCancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="space-y-4">
              <div className="enterprise-card p-4">
                <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-foreground-secondary mb-4">
                  This action will reset all parking slots to available status and cancel all active bookings.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleResetSlots}
                  className="glow-danger"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Slots
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};