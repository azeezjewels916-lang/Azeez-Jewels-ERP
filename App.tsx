import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ZoomIn, ZoomOut, Maximize, Shield } from 'lucide-react';
import { Login } from './pages/Login';
import { SalesBill } from './pages/SalesBill';
import { AllSales } from './pages/AllSales';
import { Layaway } from './pages/Layaway';
import { AdvanceBooking } from './pages/AdvanceBooking';
import { Inventory } from './pages/Inventory';
import { Customers } from './pages/Customers';
import { GoldExchange } from './pages/GoldExchange';
import { Users } from './pages/Users';
import { WebsitePage } from './pages/Website';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('user'));
  const [activeModule, setActiveModule] = useState('sales-bill');
  const [zoomLevel, setZoomLevel] = useState(0.85); // Default zoomed out for better fit
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  // User Role State
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [userRole, setUserRole] = useState<string>(currentUser.role || 'admin');

  // Admin GST Control State
  const [isGstControlEnabled, setIsGstControlEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('admin_gst_control_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleGstControl = () => {
    const nextVal = !isGstControlEnabled;
    setIsGstControlEnabled(nextVal);
    localStorage.setItem('admin_gst_control_enabled', JSON.stringify(nextVal));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleToggleRole = () => {
    if (userRole === 'staff') {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // If user originally authenticated as admin, allow direct toggle back
      if (storedUser.authenticated_role === 'admin') {
        setUserRole('admin');
        return;
      }

      // Prompt staff user for Admin Password
      const enteredPass = window.prompt('Security Lock: Enter Admin Password to access Full ERP:');
      if (enteredPass === 'admin123' || enteredPass === 'admin') {
        setUserRole('admin');
        // Temporarily elevate current session role
        storedUser.role = 'admin';
        localStorage.setItem('user', JSON.stringify(storedUser));
        alert('Admin Access Granted: Full ERP Unlocked.');
      } else if (enteredPass !== null) {
        alert('Access Denied: Incorrect Admin Password.');
      }
    } else {
      // Switch Admin to Staff Preview Mode
      setUserRole('staff');
      setActiveModule('sales-bill');
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.05, 1.2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.05, 0.5));
  const handleResetZoom = () => setZoomLevel(0.85);

  const handleEditSale = (billId: string) => {
    setEditingBillId(billId);
    setActiveModule('sales-bill');
  };

  const STAFF_ALLOWED_MODULES = ['sales-bill', 'all-sales', 'layaway', 'advance', 'customers'];

  const navigateToModule = (module: string) => {
    // If staff role, allow access to 5 modules: sales-bill, all-sales, layaway, advance, customers
    if (userRole === 'staff' && !STAFF_ALLOWED_MODULES.includes(module)) {
      return;
    }
    if (module !== 'sales-bill') {
      setEditingBillId(null);
    }
    setActiveModule(module);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(user.role || 'admin');
      if (user.role === 'staff') {
        setActiveModule('sales-bill');
      }
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <div className="flex min-h-screen bg-app-bg overflow-hidden relative">
      <style>{`
        @media print {
          /* Hide everything in the app */
          .print-hidden, .print\:hidden, .print\\:hidden, header, aside, .zoom-controls { display: none !important; }
          
          /* Reset layout for printing */
          body, html, #root, .min-h-screen, main { 
            height: auto !important; 
            min-height: 0 !important;
            overflow: visible !important; 
            margin: 0 !important; 
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            display: block !important;
            position: static !important;
          }

          /* Ensure main content doesn't have sidebar margin */
          main { 
            margin-left: 0 !important; 
            padding: 0 !important;
            display: block !important;
            width: 100% !important;
          }
          
          .print-block {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .no-print-zoom { zoom: 1 !important; transform: none !important; }
        }
      `}</style>

      <div className="print:hidden">
        <Sidebar
          onLogout={handleLogout}
          activeModule={activeModule}
          setActiveModule={navigateToModule}
          userRole={userRole}
          onToggleRole={handleToggleRole}
        />
      </div>

      {/* Main Content Area */}
      <main className="ml-64 print:ml-0 flex-1 h-screen flex flex-col overflow-hidden">
        {/* Top Bar for User Profile/Context - minimalist luxury */}
        <header className="h-16 bg-white border-b border-app-border flex items-center justify-between px-8 shrink-0 print:hidden shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="font-serif font-bold text-xl text-charcoal-900 tracking-tight flex items-center gap-3">
              <span>
                {activeModule === 'sales-bill' ? 'New Sales Invoice' :
                  activeModule === 'all-sales' ? 'Sales History' :
                    activeModule === 'layaway' ? 'Layaway Management' :
                      activeModule === 'advance' ? 'Order Bookings' :
                        activeModule === 'inventory' ? 'Inventory Management' :
                          activeModule === 'customers' ? 'Client Relationship Management' :
                            activeModule === 'gold-exchange' ? 'Gold Exchange (Buying)' :
                              activeModule === 'users' ? 'User Management' :
                                activeModule.replace('-', ' ').toUpperCase()}
              </span>
            </h1>

            {/* Zoom Controls */}
            <div className="flex items-center bg-gold-50/70 rounded-lg p-1 gap-1 border border-gold-500/20 ml-2">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md text-charcoal-700 hover:text-gold-600 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <div
                className="text-[11px] font-bold text-charcoal-700 px-2 cursor-pointer hover:text-gold-600 font-mono"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md text-charcoal-700 hover:text-gold-600 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* GST CONTROL TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleGstControl}
              title="Toggle Master GST Control Systemwide"
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 border cursor-pointer ${
                isGstControlEnabled
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
              }`}
            >
              <Shield size={14} />
              <span>GST: {isGstControlEnabled ? 'ACTIVE (3%)' : 'DISABLED (0%)'}</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gold-600 uppercase tracking-wider">Azeez Jewels Showroom</p>
              <p className="text-[10px] text-charcoal-500 font-mono tracking-wide">#324 Jumma Masjid Road | {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-charcoal-900 text-gold-500 flex items-center justify-center font-bold text-xs shadow-md border border-gold-500/40 relative">
              AJ
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${userRole === 'admin' ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Container with Zoom */}
        <div
          className="flex-1 overflow-auto bg-app-bg no-print-zoom"
          style={{
            zoom: zoomLevel,
          } as any}
        >
          <div className="p-0">
            {activeModule === 'sales-bill' ? (
              <SalesBill billId={editingBillId || undefined} onClearEdit={() => setEditingBillId(null)} />
            ) : activeModule === 'all-sales' ? (
              <AllSales onEdit={handleEditSale} />
            ) : activeModule === 'layaway' ? (
              <Layaway />
            ) : activeModule === 'advance' ? (
              <AdvanceBooking />
            ) : (activeModule === 'urd' || activeModule === 'gold-exchange') ? (
              <GoldExchange />
            ) : activeModule === 'inventory' ? (
              <Inventory />
            ) : activeModule === 'customers' ? (
              <Customers />
            ) : activeModule === 'website' ? (
              <WebsitePage />
            ) : activeModule === 'users' ? (
              <Users />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-sans font-bold text-xl py-20">
                MODULE UNDER CONSTRUCTION
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
