import React from 'react';
import { 
  FileText, 
  ShoppingBag, 
  Package, 
  Users, 
  Repeat, 
  UserCog, 
  LogOut,
  Clock,
  CalendarCheck,
  Globe
} from 'lucide-react';
import { Logo } from './UIComponents';

interface SidebarProps {
  onLogout: () => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  userRole?: string;
  isStaffMode?: boolean;
  onToggleRole?: () => void;
}

const NAV_ITEMS = [
  { id: 'sales-bill', label: 'Sales Bill', icon: FileText },
  { id: 'all-sales', label: 'All Sales', icon: ShoppingBag },
  { id: 'advance', label: 'Order Booking', icon: CalendarCheck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'users', label: 'User Management', icon: UserCog },
];

const STAFF_ALLOWED_MODULES = ['sales-bill'];

export const Sidebar: React.FC<SidebarProps> = ({ 
  onLogout, 
  activeModule, 
  setActiveModule,
  userRole = 'admin',
  isStaffMode = false,
  onToggleRole
}) => {
  const isStaff = userRole === 'staff' || isStaffMode;

  // Staff users have access to Sales Bill only
  const visibleNavItems = isStaff 
    ? NAV_ITEMS.filter(item => STAFF_ALLOWED_MODULES.includes(item.id))
    : NAV_ITEMS;

  return (
    <aside className="w-64 h-screen bg-charcoal-900 border-r border-charcoal-800 flex flex-col fixed left-0 top-0 z-50 text-white print:hidden shadow-luxury">
      <div className="h-24 flex items-center px-6 border-b border-charcoal-800/80 gap-3.5 bg-gradient-to-b from-charcoal-900 to-charcoal-800/40">
         <Logo light className="scale-90" />
         <div className="flex flex-col">
           <span className="font-serif text-xl font-bold tracking-tight text-white leading-tight gold-gradient-text">Azeez Jewels</span>
           <span className="text-[10px] text-gold-500 font-medium tracking-wider uppercase mt-0.5">22 Ct 916 KDM Gold & Silver</span>
         </div>
      </div>

      <nav className="flex-1 py-6 space-y-1.5 px-3">
        {visibleNavItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-xs transition-all duration-200 relative rounded-lg cursor-pointer
                ${isActive ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-500 font-bold border-l-4 border-gold-500 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-charcoal-800/60 font-medium'}
              `}
            >
              <Icon 
                size={18} 
                className={`
                  mr-3 transition-colors duration-200
                  ${isActive ? 'text-gold-500 scale-110' : 'text-gray-400'}
                `} 
              />
              <span className={isActive ? 'font-bold tracking-wide text-white' : 'font-medium'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-charcoal-800/80 bg-charcoal-900">
        <button 
          onClick={onLogout}
          className="flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-xs font-bold uppercase tracking-wider w-full px-3 py-2.5 rounded-lg cursor-pointer"
        >
          <LogOut size={16} className="mr-2" />
          Logout System
        </button>
      </div>
    </aside>
  );
};