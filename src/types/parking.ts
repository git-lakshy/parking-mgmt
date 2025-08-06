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
  status: 'active' | 'cancelled';
}

export interface AdminUser {
  username: string;
  isAuthenticated: boolean;
}