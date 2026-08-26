
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
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. If username and password are NOT provided, default directly to Staff POS Mode
    if (!cleanUser && !cleanPass) {
      const staffUser = {
        id: 'staff-001',
        username: 'staff',
        role: 'staff',
        authenticated_role: 'staff',
        staff_code: 'STF01',
        can_edit_bills: false,
        can_edit_stock: false,
        can_authorize_nongst: false
      };
      localStorage.setItem('user', JSON.stringify(staffUser));
      toast({ title: 'Staff Billing Access', description: 'Access Granted: Staff Sales Bill POS' });
      onLogin();
      return;
    }

    setLoading(true);
    try {
      // 2. Check default Admin credentials (Strictly Azeezazmath!123 / Azeez!20)
      const isAdminUser = cleanUser === 'azeezazmath!123';
      const isAdminPass = cleanPass === 'azeez!20';

      if (isAdminUser && isAdminPass) {
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
        toast({ title: 'Admin Access Granted', description: 'Welcome Azmathulla Khan (Full ERP Access Unlocked)' });
        onLogin();
        return;
      }

      // 3. Query Supabase database users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUser)
        .single();

      if (!error && user && cleanPass === user.password_hash) {
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
        return;
      }

      // 4. Default fallback to Staff POS access
      const staffUser = {
        id: 'staff-001',
        username: cleanUser || 'staff',
        role: 'staff',
        authenticated_role: 'staff',
        staff_code: 'STF01',
        can_edit_bills: false,
        can_edit_stock: false,
        can_authorize_nongst: false
      };
      localStorage.setItem('user', JSON.stringify(staffUser));
      toast({ title: 'Staff Billing Access', description: 'Access Granted: Staff Sales Bill POS' });
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      const staffUser = {
        id: 'staff-001',
        username: 'staff',
        role: 'staff',
        authenticated_role: 'staff',
        staff_code: 'STF01',
        can_edit_bills: false,
        can_edit_stock: false,
        can_authorize_nongst: false
      };
      localStorage.setItem('user', JSON.stringify(staffUser));
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-app-border relative overflow-hidden shadow-luxury transition-all duration-300">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/15 via-gold-500/5 to-transparent rounded-bl-full pointer-events-none" />

        <div className="mb-8 text-center flex flex-col items-center">
          <Logo className="mb-3" />
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tight gold-gradient-text">Azeez Jewels</h1>
          <p className="text-[11px] text-gold-600 font-bold tracking-widest uppercase mt-1">22 Ct 916 KDM Gold & Silver Ornaments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <UnderlineInput
              label="Username / ID"
              placeholder="Admin ID"
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
            <Button type="submit" fullWidth disabled={loading} className="h-12 text-sm shadow-md">
              {loading ? 'Signing In...' : 'SIGN IN TO SYSTEM'}
            </Button>

            <div className="pt-2 text-center text-[10px] text-charcoal-500">
              <p className="font-serif italic text-gold-600">Azeez Jewels • Shivajinagar, Bangalore</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
