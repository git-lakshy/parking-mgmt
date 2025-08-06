import { useState } from 'react';
import { ParkingSlot } from '@/types/parking';
import { Button } from '@/components/ui/button';
import { Car, Clock, Check } from 'lucide-react';

interface ParkingGridProps {
  slots: ParkingSlot[];
  onSlotSelect: (slot: ParkingSlot) => void;
  isAdminMode?: boolean;
}

export const ParkingGrid = ({ slots, onSlotSelect, isAdminMode = false }: ParkingGridProps) => {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const getSlotIcon = (status: ParkingSlot['status']) => {
    switch (status) {
      case 'available':
        return <Check className="w-4 h-4" />;
      case 'occupied':
        return <Car className="w-4 h-4" />;
      case 'reserved':
        return <Clock className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const getSlotVariant = (status: ParkingSlot['status']) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-6">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="relative group"
          onMouseEnter={() => setHoveredSlot(slot.id)}
          onMouseLeave={() => setHoveredSlot(null)}
        >
          <Button
            variant={getSlotVariant(slot.status)}
            size="lg"
            className={`
              w-full h-20 flex flex-col items-center justify-center gap-2 
              enterprise-card transition-all duration-300 ease-in-out
              ${slot.status === 'available' ? 'glow-success hover:scale-105' : ''}
              ${slot.status === 'occupied' ? 'glow-danger' : ''}
              ${slot.status === 'reserved' ? 'border-warning bg-warning/10' : ''}
              ${hoveredSlot === slot.id ? 'scale-105 shadow-2xl' : ''}
            `}
            onClick={() => onSlotSelect(slot)}
            disabled={!isAdminMode && slot.status !== 'available'}
          >
            <div className={`status-indicator ${
              slot.status === 'available' ? 'status-available' : 
              slot.status === 'occupied' ? 'status-occupied' : 'status-reserved'
            }`} />
            {getSlotIcon(slot.status)}
            <span className="text-xs font-medium">{slot.number}</span>
          </Button>

          {hoveredSlot === slot.id && slot.booking && (
            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 enterprise-card min-w-[200px]">
              <div className="text-xs">
                <p className="font-medium text-primary">{slot.booking.customerName}</p>
                <p className="text-foreground-secondary">{slot.booking.vehicleNumber}</p>
                <p className="text-muted-foreground">
                  {new Date(slot.booking.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};