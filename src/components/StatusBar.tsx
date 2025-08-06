import { ParkingSlot, Booking } from '@/types/parking';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Clock, 
  Check, 
  Users,
  Activity
} from 'lucide-react';

interface StatusBarProps {
  slots: ParkingSlot[];
  bookings: Booking[];
}

export const StatusBar = ({ slots, bookings }: StatusBarProps) => {
  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    occupied: slots.filter(s => s.status === 'occupied').length,
    reserved: slots.filter(s => s.status === 'reserved').length,
    activeBookings: bookings.filter(b => b.status === 'active').length,
  };

  const occupancyRate = stats.total > 0 ? ((stats.occupied + stats.reserved) / stats.total * 100).toFixed(1) : '0';

  return (
    <div className="enterprise-card p-4 m-6 mb-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">System Status</span>
            <Badge variant="default" className="bg-success text-success-foreground">
              Online
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Occupancy:</span>
            <span className="text-lg font-bold text-primary">{occupancyRate}%</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="status-indicator status-available" />
            <Check className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">{stats.available}</span>
            <span className="text-xs text-foreground-secondary">Available</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="status-indicator status-occupied" />
            <Car className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">{stats.occupied}</span>
            <span className="text-xs text-foreground-secondary">Occupied</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="status-indicator status-reserved" />
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">{stats.reserved}</span>
            <span className="text-xs text-foreground-secondary">Reserved</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{stats.activeBookings}</span>
            <span className="text-xs text-foreground-secondary">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};