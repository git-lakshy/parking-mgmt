import { useState, useCallback } from 'react';
import { ParkingSlot, Booking, AdminUser } from '@/types/parking';

export const useParkingSystem = () => {
  // Initialize with some demo slots
  const [slots, setSlots] = useState<ParkingSlot[]>(() => 
    Array.from({ length: 32 }, (_, i) => ({
      id: `slot-${i + 1}`,
      number: `${String.fromCharCode(65 + Math.floor(i / 8))}${(i % 8) + 1}`,
      status: Math.random() > 0.7 ? 'occupied' : 'available',
    }))
  );

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const generateBookingId = () => 
    Math.random().toString(36).substr(2, 9).toUpperCase();

  const bookSlot = useCallback((bookingData: Omit<Booking, 'id' | 'timestamp' | 'status'>) => {
    const booking: Booking = {
      ...bookingData,
      id: generateBookingId(),
      timestamp: new Date(),
      status: 'active',
    };

    setBookings(prev => [...prev, booking]);
    setSlots(prev => prev.map(slot => 
      slot.id === bookingData.slotId 
        ? { ...slot, status: 'occupied', booking }
        : slot
    ));
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ));
    
    setSlots(prev => prev.map(slot => 
      slot.id === booking.slotId 
        ? { ...slot, status: 'available', booking: undefined }
        : slot
    ));
  }, [bookings]);

  const addSlot = useCallback((slotNumber: string) => {
    const newSlot: ParkingSlot = {
      id: `slot-${Date.now()}`,
      number: slotNumber,
      status: 'available',
    };
    setSlots(prev => [...prev, newSlot]);
  }, []);

  const removeSlot = useCallback((slotId: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== slotId));
  }, []);

  const resetSlots = useCallback(() => {
    setSlots(prev => prev.map(slot => ({
      ...slot,
      status: 'available',
      booking: undefined,
    })));
    setBookings(prev => prev.map(booking => ({
      ...booking,
      status: 'cancelled',
    })));
  }, []);

  const adminLogin = useCallback((username: string, password: string): boolean => {
    // Demo credentials
    if (username === 'admin' && password === 'admin123') {
      setAdminUser({
        username: 'admin',
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUser(null);
  }, []);

  return {
    slots,
    bookings,
    adminUser,
    bookSlot,
    cancelBooking,
    addSlot,
    removeSlot,
    resetSlots,
    adminLogin,
    adminLogout,
  };
};