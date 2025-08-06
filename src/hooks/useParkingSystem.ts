import { useState, useCallback } from 'react';
import { ParkingSlot, Booking, AdminUser, Report } from '@/types/parking';

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
  const [reports, setReports] = useState<Report[]>([]);

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
        ? { ...slot, status: 'reserved', booking }
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

  const completeBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'completed' } : b
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

  const submitReport = useCallback((slotId: string, reporterName: string, message: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const report: Report = {
      id: generateBookingId(),
      slotId,
      slotNumber: slot.number,
      reporterName,
      message,
      timestamp: new Date(),
      status: 'pending',
    };

    setReports(prev => [...prev, report]);
  }, [slots]);

  const resolveReport = useCallback((reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'resolved' } : report
    ));
  }, []);

  const emptySlot = useCallback((slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    // Find and cancel any booking for this slot
    const booking = bookings.find(b => b.slotId === slotId && b.status === 'active');
    if (booking) {
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' } : b
      ));
    }

    // Make slot available
    setSlots(prev => prev.map(s => 
      s.id === slotId 
        ? { ...s, status: 'available', booking: undefined }
        : s
    ));
  }, [bookings, slots]);

  const searchSlots = useCallback((term: string) => {
    if (!term.trim()) return slots;
    
    const searchTerm = term.toLowerCase();
    return slots.filter(slot => {
      // Search by slot number
      if (slot.number.toLowerCase().includes(searchTerm)) return true;
      
      // Search by customer name if slot has booking
      if (slot.booking && slot.booking.customerName.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });
  }, [slots]);

  const searchBookings = useCallback((term: string) => {
    if (!term.trim()) return bookings;
    
    const searchTerm = term.toLowerCase();
    return bookings.filter(booking => {
      return booking.customerName.toLowerCase().includes(searchTerm) ||
             booking.vehicleNumber.toLowerCase().includes(searchTerm) ||
             booking.id.toLowerCase().includes(searchTerm);
    });
  }, [bookings]);

  return {
    slots,
    bookings,
    adminUser,
    reports,
    bookSlot,
    cancelBooking,
    completeBooking,
    addSlot,
    removeSlot,
    resetSlots,
    adminLogin,
    adminLogout,
    submitReport,
    resolveReport,
    emptySlot,
    searchSlots,
    searchBookings,
  };
};