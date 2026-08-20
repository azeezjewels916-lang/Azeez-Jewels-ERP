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
  CalendarCheck
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
  { id: 'layaway', label: 'Layaway', icon: Clock },
  { id: 'advance', label: 'Order Booking', icon: CalendarCheck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'users', label: 'User Management', icon: UserCog },
];

const STAFF_ALLOWED_MODULES = ['sales-bill', 'all-sales', 'layaway', 'advance', 'customers'];

export const Sidebar: React.FC<SidebarProps> = ({ 
  onLogout, 
  activeModule, 
  setActiveModule,
  userRole = 'admin',
  isStaffMode = false,
  onToggleRole
}) => {
  const isStaff = userRole === 'staff' || isStaffMode;

  // Staff users have access to 5 modules: Sales Bill, All Sales, Layaway, Order Booking, Customers
  const visibleNavItems = isStaff 
    ? NAV_ITEMS.filter(item => STAFF_ALLOWED_MODULES.includes(item.id))
    : NAV_ITEMS;

  return (
    <aside className="w-64 h-screen bg-charcoal-900 border-r border-charcoal-800 flex flex-col fixed left-0 top-0 z-50 text-white print:hidden shadow-luxury">
      <div className="h-20 flex items-center px-5 border-b border-charcoal-800 gap-3">
         <Logo light />
         <div className="flex flex-col">
           <span className="font-serif text-lg font-bold tracking-tight text-white leading-tight">Azeez Jewels</span>
           <span className="text-[10px] text-gold-500 font-medium tracking-wide">22 Ct 916 KDM Gold & Silver</span>
         </div>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = activeModule === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`
                w-full flex items-center px-6 py-3.5 text-sm transition-all duration-200 relative
                ${isActive ? 'bg-charcoal-800 text-gold-500 font-semibold' : 'text-gray-400 hover:text-white hover:bg-charcoal-800/60'}
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-500" />
              )}
              <Icon 
                size={18} 
                className={`
                  mr-3 transition-colors duration-200
                  ${isActive ? 'text-gold-500' : 'text-gray-400'}
                `} 
              />
              <span className={isActive ? 'font-semibold tracking-wide' : 'font-normal'}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-charcoal-800 space-y-2.5">
        {onToggleRole && (
          <button
            onClick={onToggleRole}
            className="w-full text-xs font-bold text-gold-500 hover:text-gold-100 bg-charcoal-800/80 hover:bg-charcoal-800 py-2 px-3 rounded-md border border-gold-500/30 flex items-center justify-between transition-all"
          >
            <span>Role: {isStaff ? 'Staff (Billing Only)' : 'Admin (Full ERP)'}</span>
            <span className="underline text-[10px] text-gold-500">Switch</span>
          </button>
        )}
        <button 
          onClick={onLogout}
          className="flex items-center text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm w-full px-2 py-2 font-medium"
        >
          <LogOut size={16} className="mr-3" />
          Logout System
        </button>
      </div>
    </aside>
  );
};