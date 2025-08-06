export interface ParkingSlot {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  booking?: Booking;
}

export interface Booking {
  id: string;
  slotId: string;
  customerName: string;
  vehicleNumber: string;
  timestamp: Date;
  status: 'active' | 'cancelled' | 'completed';
}

export interface AdminUser {
  username: string;
  isAuthenticated: boolean;
}

export interface Report {
  id: string;
  slotId: string;
  slotNumber: string;
  reporterName: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'resolved';
}