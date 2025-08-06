import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ParkingSlot, Booking, AdminUser, Report } from '@/types/parking';

export const useParkingSystem = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const generateBookingId = () => 
    Math.random().toString(36).substr(2, 9).toUpperCase();

  // Load initial data from Supabase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('parking_slots')
        .select('*')
        .order('number');
      
      if (slotsError) throw slotsError;

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (bookingsError) throw bookingsError;

      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (reportsError) throw reportsError;

      // Convert data to match frontend types
      const transformedSlots: ParkingSlot[] = (slotsData || []).map(slot => {
        const activeBooking = bookingsData?.find(b => b.slot_id === slot.id && b.status === 'active');
        return {
          id: slot.id,
          number: slot.number,
          status: slot.status as 'available' | 'occupied' | 'reserved',
          booking: activeBooking ? {
            id: activeBooking.id,
            slotId: activeBooking.slot_id,
            customerName: activeBooking.customer_name,
            vehicleNumber: activeBooking.vehicle_number,
            timestamp: new Date(activeBooking.created_at),
            status: activeBooking.status as 'active' | 'cancelled' | 'completed'
          } : undefined
        };
      });

      const transformedBookings: Booking[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        slotId: booking.slot_id,
        customerName: booking.customer_name,
        vehicleNumber: booking.vehicle_number,
        timestamp: new Date(booking.created_at),
        status: booking.status as 'active' | 'cancelled' | 'completed'
      }));

      const transformedReports: Report[] = (reportsData || []).map(report => ({
        id: report.id,
        slotId: report.slot_id,
        slotNumber: report.slot_number,
        reporterName: report.reporter_name,
        message: report.message,
        timestamp: new Date(report.created_at),
        status: report.status as 'pending' | 'resolved'
      }));

      setSlots(transformedSlots);
      setBookings(transformedBookings);
      setReports(transformedReports);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bookSlot = useCallback(async (bookingData: Omit<Booking, 'id' | 'timestamp' | 'status'>) => {
    try {
      const bookingId = generateBookingId();
      
      // Insert booking into database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          slot_id: bookingData.slotId,
          customer_name: bookingData.customerName,
          vehicle_number: bookingData.vehicleNumber,
          status: 'active'
        });

      if (bookingError) throw bookingError;

      // Update slot status
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'reserved' })
        .eq('id', bookingData.slotId);

      if (slotError) throw slotError;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error booking slot:', error);
      throw error;
    }
  }, [loadData]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Update slot status
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slotId);

      if (slotError) throw slotError;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }, [bookings, loadData]);

  const completeBooking = useCallback(async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Update slot status
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'available' })
        .eq('id', booking.slotId);

      if (slotError) throw slotError;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }, [bookings, loadData]);

  const addSlot = useCallback(async (slotNumber: string) => {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .insert({
          number: slotNumber,
          status: 'available'
        });

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error adding slot:', error);
      throw error;
    }
  }, [loadData]);

  const removeSlot = useCallback(async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error removing slot:', error);
      throw error;
    }
  }, [loadData]);

  const resetSlots = useCallback(async () => {
    try {
      // Cancel all active bookings
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('status', 'active');

      if (bookingError) throw bookingError;

      // Reset all slots to available
      const { error: slotError } = await supabase
        .from('parking_slots')
        .update({ status: 'available' });

      if (slotError) throw slotError;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error resetting slots:', error);
      throw error;
    }
  }, [loadData]);

  const adminLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Simple demo authentication - in production, use proper password hashing
      if (username === 'admin' && password === 'admin123') {
        setAdminUser({
          username: 'admin',
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during admin login:', error);
      return false;
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUser(null);
  }, []);

  const submitReport = useCallback(async (slotId: string, reporterName: string, message: string) => {
    try {
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return;

      const { error } = await supabase
        .from('reports')
        .insert({
          id: generateBookingId(),
          slot_id: slotId,
          slot_number: slot.number,
          reporter_name: reporterName,
          message: message,
          status: 'pending'
        });

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }, [slots, loadData]);

  const resolveReport = useCallback(async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  }, [loadData]);

  const emptySlot = useCallback(async (slotId: string) => {
    try {
      // Find and cancel any active booking for this slot
      const activeBooking = bookings.find(b => b.slotId === slotId && b.status === 'active');
      if (activeBooking) {
        await cancelBooking(activeBooking.id);
      } else {
        // Just update slot status if no booking
        const { error } = await supabase
          .from('parking_slots')
          .update({ status: 'available' })
          .eq('id', slotId);

        if (error) throw error;
        await loadData();
      }
    } catch (error) {
      console.error('Error emptying slot:', error);
      throw error;
    }
  }, [bookings, cancelBooking, loadData]);

  const searchSlots = useCallback((term: string) => {
    if (!term.trim()) return slots;
    
    const searchTerm = term.toLowerCase();
    return slots.filter(slot => {
      if (slot.number.toLowerCase().includes(searchTerm)) return true;
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
    loading,
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