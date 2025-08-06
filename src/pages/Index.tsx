import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParkingSlot } from '@/types/parking';
import { useParkingSystem } from '@/hooks/useParkingSystem';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';
import { QuickActions } from '@/components/QuickActions';
import { ParkingGrid } from '@/components/ParkingGrid';
import { BookingModal } from '@/components/BookingModal';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPanel } from '@/components/AdminPanel';
import { CancelBookingModal } from '@/components/CancelBookingModal';
import { ReportModal } from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, Clock, Check, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const {
    slots,
    bookings,
    adminUser,
    bookSlot,
    cancelBooking,
    completeBooking,
    addSlot,
    removeSlot,
    resetSlots,
    adminLogin,
    adminLogout,
    submitReport,
    searchSlots,
    searchBookings,
  } = useParkingSystem();

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isBookingsViewOpen, setIsBookingsViewOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBookingForCompletion, setSelectedBookingForCompletion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Redirect admin to dashboard after login
  useEffect(() => {
    if (adminUser?.isAuthenticated) {
      navigate('/admin');
    }
  }, [adminUser, navigate]);

  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setIsBookingModalOpen(true);
    } else if (slot.status === 'reserved') {
      toast({
        title: "Slot Reserved",
        description: `Slot ${slot.number} is reserved by you.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Slot Unavailable",
        description: `Slot ${slot.number} is currently occupied.`,
        variant: "destructive",
      });
    }
  };

  const handleReportSlot = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setIsReportModalOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      toast({
        title: "Search Results",
        description: `Searching for: "${term}"`,
        variant: "default",
      });
    }
  };

  const handleRefresh = () => {
    // Reset search and refresh data
    setSearchTerm('');
    toast({
      title: "System Refreshed",
      description: "Parking data has been updated.",
    });
  };

  const activeBookings = bookings.filter(b => b.status === 'active');
  
  // Filter data based on search
  const filteredSlots = searchTerm ? searchSlots(searchTerm) : slots;
  const filteredBookings = searchTerm ? searchBookings(searchTerm) : activeBookings;

  const handleCompleteBooking = (bookingId: string) => {
    setSelectedBookingForCompletion(bookingId);
  };

  const confirmCompleteBooking = () => {
    if (selectedBookingForCompletion) {
      completeBooking(selectedBookingForCompletion);
      setSelectedBookingForCompletion(null);
      toast({
        title: "Booking Completed",
        description: "The parking slot is now available.",
        variant: "default",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onAdminLogin={() => setIsAdminLoginOpen(true)}
        onAdminLogout={adminLogout}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        adminUser={adminUser}
      />

      <StatusBar slots={slots} bookings={bookings} />

      <QuickActions
        onBookSlot={() => {
          const availableSlot = slots.find(s => s.status === 'available');
          if (availableSlot) {
            setSelectedSlot(availableSlot);
            setIsBookingModalOpen(true);
          } else {
            toast({
              title: "No Available Slots",
              description: "All parking slots are currently occupied.",
              variant: "destructive",
            });
          }
        }}
        onCancelBooking={() => setIsCancelModalOpen(true)}
        onRefresh={handleRefresh}
        onViewBookings={() => setIsBookingsViewOpen(true)}
      />

      <ParkingGrid
        slots={filteredSlots}
        onSlotSelect={handleSlotSelect}
        isAdminMode={false}
        onReportSlot={handleReportSlot}
      />

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        slot={selectedSlot}
        onConfirmBooking={bookSlot}
        onReportSlot={handleReportSlot}
      />

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={adminLogin}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        slots={slots}
        bookings={bookings}
        onAddSlot={addSlot}
        onRemoveSlot={removeSlot}
        onResetSlots={resetSlots}
        onCancelBooking={cancelBooking}
      />

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        bookings={bookings}
        onCancelBooking={cancelBooking}
      />

      {/* Bookings View Modal */}
      <Dialog open={isBookingsViewOpen} onOpenChange={setIsBookingsViewOpen}>
        <DialogContent className="enterprise-card border-card-border max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Active Bookings ({filteredBookings.length})
              {searchTerm && <Badge variant="secondary">Filtered</Badge>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const slot = slots.find(s => s.id === booking.slotId);
                return (
                  <div key={booking.id} className="enterprise-card p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-primary" />
                        <span className="font-medium">{booking.customerName}</span>
                        <Badge variant="secondary">{slot?.number}</Badge>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                        <span>{booking.vehicleNumber}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Booking ID: {booking.id}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteBooking(booking.id)}
                      className="bg-success/10 border-success hover:bg-success hover:text-success-foreground"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-foreground-secondary">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active bookings found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Booking Confirmation Dialog */}
      <Dialog open={!!selectedBookingForCompletion} onOpenChange={() => setSelectedBookingForCompletion(null)}>
        <DialogContent className="enterprise-card border-card-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
              <Check className="w-5 h-5" />
              Complete Booking
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-foreground-secondary">
              Are you sure you want to mark this booking as completed? This will make the parking slot available again.
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setSelectedBookingForCompletion(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                onClick={confirmCompleteBooking}
                className="flex-1 bg-success hover:bg-success/90"
              >
                Yes, Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        slot={selectedSlot}
        onSubmitReport={(slotId, reporterName, message) => {
          submitReport(slotId, reporterName, message);
          toast({
            title: "Report Submitted",
            description: "Your report has been sent to the admin.",
            variant: "default",
          });
        }}
      />
    </div>
  );
};

export default Index;
