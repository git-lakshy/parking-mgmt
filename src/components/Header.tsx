import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Car, Shield, Search, LogOut, Settings } from 'lucide-react';
import { AdminUser } from '@/types/parking';
interface HeaderProps {
  onSearch: (term: string) => void;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenAdminPanel: () => void;
  adminUser: AdminUser | null;
}
export const Header = ({
  onSearch,
  onAdminLogin,
  onAdminLogout,
  onOpenAdminPanel,
  adminUser
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  return <header className="border-b border-card-border bg-background-secondary">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg glow-primary">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ParkingHub</h1>
                <p className="text-xs text-foreground-secondary">
Parking Management</p>
              </div>
            </div>
            <Badge variant="default" className="bg-success text-success-foreground">
              LIVE
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Search slots, bookings..." 
                className="enterprise-card pl-10 w-48 lg:w-64 transition-all duration-300 focus:w-72" 
              />
            </form>

            {adminUser?.isAuthenticated ? <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary glow-shield" />
                  <span className="text-sm font-medium hidden sm:inline">{adminUser.username}</span>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <Button size="sm" variant="default" onClick={onOpenAdminPanel} className="glow-primary">
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Control Panel</span>
                </Button>
                <Button size="sm" variant="secondary" onClick={onAdminLogout}>
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div> : <Button size="sm" variant={adminUser?.isAuthenticated ? "default" : "outline"} onClick={onAdminLogin} className={adminUser?.isAuthenticated ? "bg-success hover:bg-success/90 glow-success" : "glow-shield border-primary/30 hover:bg-primary/10 transition-all duration-300"}>
                <Shield className={`w-4 h-4 mr-2 ${adminUser?.isAuthenticated ? 'text-success-foreground' : 'text-primary animate-pulse drop-shadow-lg'}`} />
                Admin
              </Button>}
          </div>
        </div>
      </div>
    </header>;
};