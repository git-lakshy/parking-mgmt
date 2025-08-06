import { useState } from 'react';
import { ParkingSlot } from '@/types/parking';
import { useParkingSystem } from '@/hooks/useParkingSystem';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';
import { ParkingGrid } from '@/components/ParkingGrid';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Car, 
  Clock, 
  Check, 
  Trash2,
  MessageSquare,
  Settings,
  TrendingUp,
  Home,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    slots,
    bookings,
    adminUser,
    reports,
    cancelBooking,
    addSlot,
    removeSlot,
    resetSlots,
    adminLogout,
    resolveReport,
    emptySlot,
    searchSlots,
    searchBookings,
    bookSlot,
  } = useParkingSystem();

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSlotSelect = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      // Admin can book any available slot (demo booking)
      const demoBooking = {
        slotId: slot.id,
        customerName: 'Admin Demo Booking',
        vehicleNumber: 'ADMIN001',
      };
      bookSlot(demoBooking);
      toast({
        title: "Demo Booking Created",
        description: `Slot ${slot.number} has been booked as a demo.`,
        variant: "default",
      });
    } else if (slot.status === 'occupied' || slot.status === 'reserved') {
      // Admin can empty any occupied/reserved slot
      emptySlot(slot.id);
      toast({
        title: "Slot Emptied",
        description: `Slot ${slot.number} has been made available.`,
        variant: "default",
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRefresh = () => {
    // Refresh functionality - could fetch latest data from server
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated.",
    });
  };

  const handleResolveReport = (reportId: string) => {
    resolveReport(reportId);
    toast({
      title: "Report Resolved",
      description: "The report has been marked as resolved.",
      variant: "default",
    });
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/');
    toast({
      title: "Logged Out",
      description: "Successfully logged out of admin panel.",
      variant: "default",
    });
  };

  // Filter data based on search
  const filteredSlots = searchTerm ? searchSlots(searchTerm) : slots;
  const filteredBookings = searchTerm ? searchBookings(searchTerm) : bookings;

  // Dashboard stats
  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    occupied: slots.filter(s => s.status === 'occupied').length,
    reserved: slots.filter(s => s.status === 'reserved').length,
    activeBookings: bookings.filter(b => b.status === 'active').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    todayBookings: bookings.filter(b => {
      const today = new Date();
      const bookingDate = new Date(b.timestamp);
      return bookingDate.toDateString() === today.toDateString();
    }).length,
  };

  const occupancyRate = stats.total > 0 ? ((stats.occupied + stats.reserved) / stats.total * 100).toFixed(1) : '0';

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onAdminLogin={() => {}}
        onAdminLogout={adminLogout}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        adminUser={adminUser}
      />

      <StatusBar slots={slots} bookings={bookings} />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground-secondary">Manage parking operations and monitor system health</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="glow-primary"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              variant="default" 
              onClick={() => setIsAdminPanelOpen(true)}
              className="glow-primary"
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="bg-secondary/50 hover:bg-secondary"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">
                Occupancy Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{occupancyRate}%</div>
              <p className="text-xs text-foreground-secondary">
                {stats.occupied + stats.reserved} of {stats.total} slots
              </p>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">
                Active Bookings
              </CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.activeBookings}</div>
              <p className="text-xs text-foreground-secondary">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">
                Pending Reports
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingReports}</div>
              <p className="text-xs text-foreground-secondary">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">
                Today's Bookings
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.todayBookings}</div>
              <p className="text-xs text-foreground-secondary">
                Since midnight
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">
              Reports 
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings">Active Bookings</TabsTrigger>
            <TabsTrigger value="slots">Slot Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Parking Grid Overview</CardTitle>
                <CardDescription className="text-foreground-secondary">
                  Click on available slots to create demo bookings, or occupied/reserved slots to empty them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParkingGrid
                  slots={filteredSlots}
                  onSlotSelect={handleSlotSelect}
                  isAdminMode={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">User Reports</CardTitle>
                <CardDescription className="text-foreground-secondary">
                  Handle user-submitted parking spot reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingReports.length > 0 ? (
                    pendingReports.map((report) => (
                      <div key={report.id} className="enterprise-card p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-4 h-4 text-warning" />
                              <span className="font-medium text-foreground">Slot {report.slotNumber}</span>
                              <Badge variant="secondary">{report.reporterName}</Badge>
                              <Badge variant="destructive">Pending</Badge>
                            </div>
                            <p className="text-sm text-foreground-secondary">{report.message}</p>
                            <p className="text-xs text-muted-foreground">
                              Reported: {new Date(report.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            className="bg-success/10 border-success hover:bg-success hover:text-success-foreground"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-foreground-secondary">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending reports</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Active Bookings Management</CardTitle>
                <CardDescription className="text-foreground-secondary">
                  Monitor and manage current parking reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBookings.filter(b => b.status === 'active').length > 0 ? (
                    filteredBookings.filter(b => b.status === 'active').map((booking) => {
                      const slot = slots.find(s => s.id === booking.slotId);
                      return (
                        <div key={booking.id} className="enterprise-card p-4 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <Car className="w-4 h-4 text-primary" />
                              <span className="font-medium text-foreground">{booking.customerName}</span>
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
                              ID: {booking.id}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => emptySlot(booking.slotId)}
                              className="bg-warning/10 border-warning hover:bg-warning hover:text-warning-foreground"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Empty Slot
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
                              className="bg-destructive/10 border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-foreground-secondary">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active bookings</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Slot Management</CardTitle>
                <CardDescription className="text-foreground-secondary">
                  Add, remove, and manage parking slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button 
                    variant="default" 
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="glow-primary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Open Advanced Settings
                  </Button>
                  <p className="text-sm text-foreground-secondary mt-2">
                    Access full slot management features
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin Panel Modal */}
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
    </div>
  );
};

export default AdminDashboard;