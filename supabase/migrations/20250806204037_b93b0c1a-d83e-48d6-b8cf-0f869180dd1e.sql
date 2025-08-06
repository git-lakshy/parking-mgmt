-- Create parking slots table
CREATE TABLE public.parking_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id TEXT NOT NULL PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id TEXT NOT NULL PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table (for demo purposes)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public access for demo purposes)
CREATE POLICY "Anyone can view parking slots" 
ON public.parking_slots 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert parking slots" 
ON public.parking_slots 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update parking slots" 
ON public.parking_slots 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete parking slots" 
ON public.parking_slots 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete bookings" 
ON public.bookings 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view reports" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update reports" 
ON public.reports 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_parking_slots_updated_at
  BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo parking slots
INSERT INTO public.parking_slots (number, status) VALUES
('A1', 'available'), ('A2', 'occupied'), ('A3', 'available'), ('A4', 'available'),
('A5', 'reserved'), ('A6', 'available'), ('A7', 'available'), ('A8', 'occupied'),
('B1', 'available'), ('B2', 'available'), ('B3', 'occupied'), ('B4', 'available'),
('B5', 'available'), ('B6', 'available'), ('B7', 'reserved'), ('B8', 'available'),
('C1', 'occupied'), ('C2', 'available'), ('C3', 'available'), ('C4', 'available'),
('C5', 'available'), ('C6', 'occupied'), ('C7', 'available'), ('C8', 'available'),
('D1', 'available'), ('D2', 'available'), ('D3', 'available'), ('D4', 'occupied'),
('D5', 'available'), ('D6', 'available'), ('D7', 'available'), ('D8', 'available');

-- Insert demo admin user (username: admin, password: admin123)
INSERT INTO public.admin_users (username, password_hash) VALUES
('admin', '$2a$10$K8BQC5Wl5YcGZsOXOqvnXukQN5nKzAjx6STOHt1a.VyKQRHLFpBs6');