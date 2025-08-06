import { Button } from '@/components/ui/button';
import { 
  Plus, 
  X, 
  RefreshCw,
  FileText
} from 'lucide-react';

interface QuickActionsProps {
  onBookSlot: () => void;
  onCancelBooking: () => void;
  onRefresh: () => void;
  onViewBookings: () => void;
}

export const QuickActions = ({ 
  onBookSlot, 
  onCancelBooking, 
  onRefresh,
  onViewBookings 
}: QuickActionsProps) => {
  return (
    <div className="enterprise-card p-4 m-6 mb-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="text-sm text-foreground-secondary">Manage your parking reservations</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            onClick={onBookSlot}
            className="glow-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Slot
          </Button>

          <Button
            variant="destructive"
            onClick={onCancelBooking}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Booking
          </Button>

          <Button
            variant="secondary"
            onClick={onViewBookings}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Bookings
          </Button>

          <Button
            variant="outline"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};