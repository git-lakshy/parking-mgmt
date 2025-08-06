import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Car, Shield, Search, User, LogOut, Settings } from 'lucide-react';
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
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search slots, bookings..." className="enterprise-card pl-10 w-64" />
            </form>

            {adminUser?.isAuthenticated ? <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{adminUser.username}</span>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <Button size="sm" variant="default" onClick={onOpenAdminPanel} className="glow-primary">
                  <Settings className="w-4 h-4 mr-2" />
                  Control Panel
                </Button>
                <Button size="sm" variant="secondary" onClick={onAdminLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div> : <Button size="sm" variant="outline" onClick={onAdminLogin}>
                <User className="w-4 h-4 mr-2" />
                Admin Login
              </Button>}
          </div>
        </div>
      </div>
    </header>;
};