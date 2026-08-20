
import React, { useState } from 'react';
import { Logo, UnderlineInput, Button, toast } from '../components/UIComponents';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: 'Login Failed', description: 'Username and password are required.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Check default fallback admin & staff credentials
      if ((cleanUser === 'admin' || cleanUser === 'admin@azeez.com' || cleanUser === 'manager') && (cleanPass === 'admin123' || cleanPass === 'admin')) {
        const adminUser = {
          id: 'admin-001',
          username: cleanUser,
          role: 'admin',
          authenticated_role: 'admin',
          staff_code: 'ADM01',
          can_edit_bills: true,
          can_edit_stock: true,
          can_authorize_nongst: true,
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast({ title: 'Welcome Back', description: 'Authenticated as ADMIN (Full ERP Access)' });
        onLogin();
        return;
      }

      if ((cleanUser === 'staff' || cleanUser === 'sales') && (cleanPass === 'staff123' || cleanPass === 'staff')) {
        const staffUser = {
          id: 'staff-001',
          username: cleanUser,
          role: 'staff',
          authenticated_role: 'staff',
          staff_code: 'STF01',
          can_edit_bills: false,
          can_edit_stock: false,
          can_authorize_nongst: false,
        };
        localStorage.setItem('user', JSON.stringify(staffUser));
        toast({ title: 'Staff Billing Login', description: 'Access Granted: Billing POS Only' });
        onLogin();
        return;
      }

      // Otherwise query Supabase DB users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user || password !== user.password_hash) {
        toast({ title: 'Authentication Error', description: 'Invalid username or password. Default Admin: admin / admin123', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        authenticated_role: user.role,
        staff_code: user.staff_code,
        can_edit_bills: user.can_edit_bills,
        can_edit_stock: user.can_edit_stock,
        can_authorize_nongst: user.can_authorize_nongst,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      toast({ title: 'Welcome Back', description: `Authenticated as ${user.role.toUpperCase()}` });
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      toast({ title: 'System Error', description: 'Failed to connect. Try admin / admin123', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStaffLogin = () => {
    const staffUser = {
      id: 'staff-101',
      username: 'staff',
      role: 'staff',
      authenticated_role: 'staff',
      staff_code: 'STF01',
      can_edit_bills: false,
      can_edit_stock: false,
      can_authorize_nongst: false
    };
    localStorage.setItem('user', JSON.stringify(staffUser));
    toast({ title: 'Staff Quick Login', description: 'Access Granted: Billing POS Only' });
    onLogin();
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-xl border border-app-border relative overflow-hidden shadow-luxury">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold-100/60 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="mb-8 text-center flex flex-col items-center">
          <Logo className="mb-3" />
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 tracking-tight">Azeez Jewels</h1>
          <p className="text-xs text-gold-600 font-medium tracking-wide mt-1">22 Ct 916 KDM Gold & Silver Ornaments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <UnderlineInput 
              label="Username" 
              placeholder="Enter your ID (e.g. admin / staff)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <UnderlineInput 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Authenticating...' : 'Enter System (Admin / Staff)'}
            </Button>
            <button
              type="button"
              onClick={handleQuickStaffLogin}
              className="w-full bg-beige-100 hover:bg-beige-200 text-charcoal-900 border border-app-border font-bold py-2.5 rounded-md text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              ⚡ Staff Quick Login (Billing POS Only)
            </button>
            <p className="text-center mt-4 text-[11px] text-charcoal-500 font-serif italic">
              Azeez Jewels ERP • Shivajinagar, Bangalore
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
