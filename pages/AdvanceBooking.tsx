'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Printer,
  Edit2,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  User,
  ShoppingBag,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserPlus,
  RefreshCw,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button, Input, Select, Card, toast } from '../components/UIComponents';
import { exportToExcel } from '../components/exportUtils';
import { FileSpreadsheet } from 'lucide-react';
import {
  getAdvanceBookings,
  createAdvanceBooking,
  updateAdvanceBooking,
  deleteAdvanceBooking,
  searchCustomers,
  createCustomer,
  createBill,
  getDailyRates,
  generateBillNo
} from '../db';
import { supabase } from '../supabaseClient';
import { AdvanceBooking as AdvanceBookingType, Customer, BillItem } from '../types';
import { AdvanceBookingPrint } from '../components/AdvanceBookingPrint';

// --- HELPERS ---
const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- COMPONENT ---
export const AdvanceBooking: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'bookings' | 'ledger'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // --- FORM STATE ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerDetails, setNewCustomerDetails] = useState({ name: '', phone: '', address: '' });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<any>({
    name: '',
    weight: 0,
    purity: '22K (916)',
    rate: 0,
    makingChargesType: 'amt',
    makingChargesInput: '',
    makingCharges: 0,
    metalType: 'gold'
  });
  const [metalRates, setMetalRates] = useState<any>(null);

  // Sync initial rate when rates are loaded or item is reset
  useEffect(() => {
    if (metalRates && !newItem.rate) {
      let rate = 0;
      if (newItem.purity.includes('22K') || newItem.purity.includes('916')) rate = metalRates.gold22k;
      else if (newItem.purity.includes('18K') || newItem.purity.includes('750')) rate = metalRates.gold18k;
      else if (newItem.purity.includes('24K') || newItem.purity.includes('Pure')) rate = metalRates.goldStd;

      if (rate > 0) {
        setNewItem(prev => ({ ...prev, rate }));
      }
    }
  }, [metalRates, newItem.purity, newItem.rate]);

  const [saleType, setSaleType] = useState<'GST' | 'NON GST'>('GST');
  const [showOldGold, setShowOldGold] = useState(false);
  const [oldGold, setOldGold] = useState<any>({ particulars: '', weight: 0, rate: 0 });
  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [manualTotal, setManualTotal] = useState<string>('');
  const [advanceInput, setAdvanceInput] = useState<string>('');
  const [notes, setNotes] = useState('');

  // --- PRINT STATE ---
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState<any>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAdvanceBookings();
      setBookings(data);
      const rates = await getDailyRates(new Date().toISOString().split('T')[0]);
      if (rates && rates.length > 0) {
        setMetalRates(rates[0]);
      }
    } catch (error) {
      console.error('Error fetching advance bookings:', error);
      toast({ title: 'Error', description: 'Failed to load bookings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    if (!filteredBookings || filteredBookings.length === 0) {
      toast({ title: 'Export Warning', description: 'No bookings data to export.', variant: 'destructive' });
      return;
    }
    const exportData = filteredBookings.map(b => ({
      Bill_No: b.bills?.bill_no || '',
      Customer_Name: b.bills?.customers?.name || '',
      Customer_Phone: b.bills?.customers?.phone || '',
      Booking_Date: formatDate(b.booking_date),
      Delivery_Date: formatDate(b.delivery_date),
      Sale_Type: b.bills?.sale_type === 'nongst' ? 'NON GST' : 'GST',
      Total_Amount: b.total_amount || 0,
      Advance_Paid: b.advance_amount || 0,
      Balance_Due: (b.total_amount - b.advance_amount) || 0,
      Status: b.booking_status
    }));
    exportToExcel(exportData, 'Order_Bookings_Report');
    toast({ title: 'Excel Exported', description: `${exportData.length} booking records downloaded.` });
  };

  // --- DERIVED VALUES ---
  const itemsTotal = useMemo(() => items.reduce((sum, item) => sum + (item.lineTotal || 0), 0), [items]);
  const gstAmount = useMemo(() => saleType === 'GST' ? itemsTotal * 0.03 : 0, [itemsTotal, saleType]);
  const oldGoldValue = useMemo(() => (oldGold.weight || 0) * (oldGold.rate || 0), [oldGold.weight, oldGold.rate]);
  const calculatedGrandTotal = Math.max(0, itemsTotal + gstAmount - oldGoldValue);
  const finalTotal = isPriceLocked ? (parseFloat(manualTotal) || 0) : calculatedGrandTotal;
  const balanceDue = finalTotal - (parseFloat(advanceInput) || 0);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const customerName = b.bills?.customers?.name || '';
      const customerPhone = b.bills?.customers?.phone || '';
      const billNo = b.bills?.bill_no || '';
      const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerPhone.includes(searchTerm) ||
        billNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.booking_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const kpiStats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalAdvance = bookings.reduce((sum, b) => sum + (b.advance_amount || 0), 0);
    const totalDue = bookings.reduce((sum, b) => sum + (b.total_amount - b.advance_amount), 0);
    const avgAdvance = totalBookings > 0 ? (totalAdvance / (totalAdvance + totalDue)) * 100 : 0;
    return { totalBookings, totalAdvance, totalDue, avgAdvance };
  }, [bookings]);

  // --- HANDLERS ---
  const handleCustomerSearch = async () => {
    if (!customerSearch) return;
    try {
      const results = await searchCustomers(customerSearch);
      setFoundCustomers(results || []);
      if (results && results.length > 0) {
        setIsAddingCustomer(false);
      } else {
        setIsAddingCustomer(true);
        setNewCustomerDetails({ name: '', phone: customerSearch, address: '' });
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      toast({ title: 'Error', description: 'Search failed.', variant: 'destructive' });
    }
  };

  const handlePhoneInputChange = async (phoneVal: string) => {
    setCustomerSearch(phoneVal);
    if (isAddingCustomer) {
      setNewCustomerDetails(prev => ({ ...prev, phone: phoneVal }));
    }
    if (phoneVal.trim().length >= 3) {
      try {
        const results = await searchCustomers(phoneVal);
        setFoundCustomers(results || []);
        if (results && results.length === 1 && !selectedCustomer) {
          setSelectedCustomer(results[0]);
          setFoundCustomers([]);
          setIsAddingCustomer(false);
        }
      } catch (err) {
        console.error('Customer search error:', err);
      }
    } else {
      setFoundCustomers([]);
    }
  };

  const handleConfirmNewCustomer = () => {
    if (!newCustomerDetails.name || !newCustomerDetails.phone) {
      toast({ title: 'Incomplete Details', description: 'Name and Phone are required.', variant: 'destructive' });
      return;
    }
    setSelectedCustomer({
      id: 'new',
      name: newCustomerDetails.name,
      phone: newCustomerDetails.phone,
      address: newCustomerDetails.address
    } as any);
    setIsAddingCustomer(false);
  };

  // Preview MC and line total for item input
  const previewNewItemMC = useMemo(() => {
    const w = Number(newItem.weight) || 0;
    const r = Number(newItem.rate) || 0;
    const mcInput = parseFloat(newItem.makingChargesInput) || 0;
    if (newItem.makingChargesType === 'pct') {
      return (w * r) * (mcInput / 100);
    }
    return mcInput;
  }, [newItem.weight, newItem.rate, newItem.makingChargesInput, newItem.makingChargesType]);

  const previewNewItemLineTotal = useMemo(() => {
    const w = Number(newItem.weight) || 0;
    const r = Number(newItem.rate) || 0;
    return (w * r) + previewNewItemMC;
  }, [newItem.weight, newItem.rate, previewNewItemMC]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.weight) {
      toast({ title: 'Missing Details', description: 'Item name and weight are required.', variant: 'destructive' });
      return;
    }
    const weight = Number(newItem.weight);
    const purity = newItem.purity || '22K (916)';
    let rate = Number(newItem.rate);
    if (!rate && metalRates) {
      if (purity.includes('22K') || purity.includes('916')) rate = metalRates.gold22k;
      else if (purity.includes('18K') || purity.includes('750')) rate = metalRates.gold18k;
      else if (purity.includes('24K') || purity.includes('Pure')) rate = metalRates.goldStd;
    }
    const mcInput = parseFloat(newItem.makingChargesInput) || 0;
    let calculatedMC = mcInput;
    if (newItem.makingChargesType === 'pct') {
      calculatedMC = (weight * rate) * (mcInput / 100);
    }
    const lineTotal = (weight * rate) + calculatedMC;
    const item = {
      id: Date.now().toString(),
      name: newItem.name,
      metalType: newItem.metalType || 'gold',
      weight,
      rate,
      makingChargesType: newItem.makingChargesType || 'amt',
      makingChargesInput: newItem.makingChargesInput || '0',
      makingCharges: calculatedMC,
      purity,
      lineTotal
    };
    setItems([...items, item]);
    setNewItem({
      weight: 0,
      rate: rate || 0,
      makingChargesType: 'amt',
      makingChargesInput: '',
      makingCharges: 0,
      purity: '22K (916)',
      name: '',
      metalType: 'gold'
    });
  };

  const handleEditBooking = (booking: any) => {
    setEditingBookingId(booking.id);
    setSelectedCustomer(booking.bills?.customers || null);
    setDeliveryDate(booking.delivery_date);
    setAdvanceInput(booking.advance_amount.toString());
    setNotes(booking.customer_notes || '');
    setSaleType(booking.bills?.sale_type === 'nongst' ? 'NON GST' : 'GST');

    const fetchItems = async () => {
      const { data: billItems, error } = await supabase
        .from('bill_items')
        .select('*')
        .eq('bill_id', booking.bill_id);

      if (!error && billItems) {
        setItems(billItems.map(bi => ({
          id: bi.id.toString(),
          name: bi.item_name,
          metalType: bi.metal_type,
          weight: bi.weight,
          rate: bi.rate,
          makingCharges: bi.making_charges,
          makingChargesType: 'amt',
          makingChargesInput: bi.making_charges ? bi.making_charges.toString() : '0',
          purity: bi.purity,
          lineTotal: bi.line_total
        })));
      }
    };
    fetchItems();
    setIsModalOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedCustomer) {
      toast({ title: 'Error', description: 'Customer is required', variant: 'destructive' });
      return;
    }
    if (!deliveryDate) {
      toast({ title: 'Error', description: 'Delivery date is required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      if (editingBookingId) {
        await updateAdvanceBooking(editingBookingId, {
          delivery_date: deliveryDate,
          advance_amount: parseFloat(advanceInput) || 0,
          total_amount: finalTotal,
          item_description: items.map(i => `${i.name} (${i.weight}g ${i.purity})`).join(', '),
          customer_notes: notes
        });

        const booking = bookings.find(b => b.id === editingBookingId);
        if (booking && booking.bill_id) {
          await supabase.from('bills').update({
            sale_type: saleType === 'NON GST' ? 'nongst' : 'gst',
            subtotal: itemsTotal,
            gst_amount: gstAmount,
            grand_total: finalTotal,
            advance_amount: parseFloat(advanceInput) || 0,
            remaining_amount: balanceDue
          }).eq('id', booking.bill_id);

          await supabase.from('bill_items').delete().eq('bill_id', booking.bill_id);
          const itemsToInsert = items.map(item => ({
            bill_id: booking.bill_id,
            item_name: item.name,
            metal_type: item.metalType,
            purity: item.purity,
            weight: item.weight,
            rate: item.rate,
            making_charges: item.makingCharges,
            line_total: item.lineTotal
          }));
          await supabase.from('bill_items').insert(itemsToInsert);
        }

        toast({ title: 'Success', description: 'Booking updated successfully.' });
        setIsModalOpen(false);
        setEditingBookingId(null);
        fetchData();
        return;
      }

      let customerId: any = selectedCustomer.id;
      if (customerId === 'new') {
        const newCust = await createCustomer({
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address
        });
        customerId = newCust.id;
      }
      const generatedBillNo = await generateBillNo();
      const bill = await createBill({
        bill_no: generatedBillNo,
        customer_id: customerId,
        sale_type: saleType === 'NON GST' ? 'nongst' : 'gst',
        subtotal: itemsTotal,
        gst_amount: gstAmount,
        grand_total: finalTotal,
        advance_amount: parseFloat(advanceInput) || 0,
        remaining_amount: balanceDue,
        bill_status: 'draft'
      });
      const newBookingRecord = await createAdvanceBooking({
        bill_id: bill.id,
        delivery_date: deliveryDate,
        advance_amount: parseFloat(advanceInput) || 0,
        total_amount: finalTotal,
        item_description: items.map(i => `${i.name} (${i.weight}g ${i.purity})`).join(', '),
        customer_notes: notes,
        booking_status: 'active'
      });

      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          bill_id: bill.id,
          item_name: item.name,
          metal_type: item.metalType,
          purity: item.purity,
          weight: item.weight,
          rate: item.rate,
          making_charges: item.makingCharges,
          line_total: item.lineTotal
        }));
        await supabase.from('bill_items').insert(itemsToInsert);
      }

      toast({ title: 'Success', description: 'Booking created successfully.' });
      setIsModalOpen(false);
      fetchData();

      const printObj = {
        ...newBookingRecord,
        bills: {
          ...bill,
          sale_type: saleType === 'NON GST' ? 'nongst' : 'gst',
          customers: selectedCustomer.id === 'new' ? { name: selectedCustomer.name, phone: selectedCustomer.phone, address: selectedCustomer.address } : selectedCustomer
        },
        saleType,
        subtotal: itemsTotal,
        gstAmount,
        oldGoldAmount: oldGoldValue
      };
      handleOpenPrintPreview(printObj, items);
      setSelectedCustomer(null);
      setItems([]);
      setAdvanceInput('');
      setManualTotal('');
      setDeliveryDate('');
      setNotes('');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({ title: 'Error', description: 'Failed to create booking.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateAdvanceBooking(id, { booking_status: status });
      toast({ title: 'Status Updated', description: `Booking is now ${status}.` });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Update failed.' });
    }
  };

  const handleOpenPrintPreview = async (booking: any, structuredItems: any[] = []) => {
    let finalItems = structuredItems;
    if ((!finalItems || finalItems.length === 0) && booking.bill_id) {
      const { data: bItems } = await supabase.from('bill_items').select('*').eq('bill_id', booking.bill_id);
      if (bItems) {
        finalItems = bItems.map(bi => ({
          id: bi.id.toString(),
          name: bi.item_name,
          metalType: bi.metal_type,
          weight: bi.weight,
          rate: bi.rate,
          makingCharges: bi.making_charges,
          purity: bi.purity,
          lineTotal: bi.line_total
        }));
      }
    }
    setSelectedBookingForPrint({ ...booking, structuredItems: finalItems });
    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    window.print();
  };

  const handleDeleteBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await deleteAdvanceBooking(id);
      toast({ title: 'Booking Deleted' });
      fetchData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({ title: 'Error', description: 'Delete failed.' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFBF7] relative overflow-hidden font-sans text-[#2D2A26]">
      <div className="flex-1 flex flex-col overflow-hidden print-hidden print:hidden">
        {/* KPI SECTION */}
        <div className="p-6 pb-2 grid grid-cols-4 gap-6 print:hidden">
          <Card className="border-t-4 border-t-gold-500 !p-4 flex flex-col justify-between shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Bookings</p>
              <div className="p-1.5 bg-gold-50 text-gold-600 rounded"><ShoppingBag size={14} /></div>
            </div>
            <h3 className="text-2xl font-bold font-serif text-[#2D2A26] mt-2">{kpiStats.totalBookings}</h3>
          </Card>
          <Card className="border-t-4 border-t-green-500 !p-4 flex flex-col justify-between shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Advance Collected</p>
              <div className="p-1.5 bg-green-50 text-green-600 rounded"><CreditCard size={14} /></div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-[#2D2A26] mt-2">{formatCurrency(kpiStats.totalAdvance)}</h3>
          </Card>
          <Card className="border-t-4 border-t-red-500 !p-4 flex flex-col justify-between shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pending Balance</p>
              <div className="p-1.5 bg-red-50 text-red-600 rounded"><DollarSign size={14} /></div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-[#2D2A26] mt-2">{formatCurrency(kpiStats.totalDue)}</h3>
          </Card>
          <Card className="border-t-4 border-t-blue-500 !p-4 flex flex-col justify-between shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Advance Coverage Ratio</p>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded"><TrendingUp size={14} /></div>
            </div>
            <h3 className="text-2xl font-bold font-mono text-[#2D2A26] mt-2">{kpiStats.avgAdvance.toFixed(1)}%</h3>
          </Card>
        </div>

        {/* HEADER & ACTION BAR */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-200 flex flex-col gap-4 bg-white print:hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Order Advance Booking</h2>
              <span className="text-xs bg-gold-100 text-gold-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-gold-300">
                Rate Lock Management
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleExportExcel} className="border border-green-600 text-green-700 hover:bg-green-50 font-bold text-xs">
                <FileSpreadsheet size={16} className="mr-1.5" /> Export Excel
              </Button>
              <div className="relative w-64">
                <Input
                  placeholder="Search Booking # / Client..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>
              <Button onClick={() => { setIsModalOpen(true); setEditingBookingId(null); setSelectedCustomer(null); setItems([]); setAdvanceInput(''); setManualTotal(''); setDeliveryDate(''); setNotes(''); setSaleType('GST'); }}>
                <Plus size={18} className="mr-2" /> New Order Booking
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-2 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === 'bookings' ? 'border-gold-500 text-[#2D2A26]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Bookings Overview
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pb-2 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${activeTab === 'ledger' ? 'border-gold-500 text-[#2D2A26]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Transaction Log
              </button>
            </div>
            {activeTab === 'bookings' && (
              <div className="flex gap-2">
                {(['all', 'active', 'delivered', 'cancelled', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all uppercase tracking-wider ${statusFilter === status
                      ? 'bg-[#2D2A26] text-white border-[#2D2A26]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT TABLE */}
        <div className="flex-1 overflow-auto p-6 print:hidden">
          {activeTab === 'bookings' ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9FAFB] border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Booking ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Dates</th>
                    <th className="py-4 px-6">Progress</th>
                    <th className="py-4 px-6 text-right">Total Amount</th>
                    <th className="py-4 px-6 text-right">Advance</th>
                    <th className="py-4 px-6 text-right">Balance</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center text-gray-400">
                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading Bookings...</span>
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center text-gray-400">
                        <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                        <span className="text-sm italic">No bookings found.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const bill = b.bills;
                      const customer = bill?.customers;
                      const remaining = b.total_amount - b.advance_amount;
                      return (
                        <tr key={b.id} className="hover:bg-[#FDFBF7] transition-colors group">
                          <td className="py-4 px-6 font-mono font-medium text-gray-600 text-xs">{bill?.bill_no || '-'}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-[#2D2A26]">{customer?.name || 'Unknown'}</div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-wide">{customer?.phone || '-'}</div>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-500">
                            <div className="flex flex-col gap-1">
                              <span><span className="font-bold text-gray-400">Booked:</span> {formatDate(b.booking_date)}</span>
                              <span><span className="font-bold text-gold-600">Due:</span> {formatDate(b.delivery_date)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 min-w-[160px]">
                            {(() => {
                              const percent = Math.min(Math.round(((b.advance_amount || 0) / (b.total_amount || 1)) * 100), 100);
                              return (
                                <>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-tight">{percent}% Paid</span>
                                    <span className="text-[10px] font-mono text-gray-400 font-bold">{formatCurrency(b.total_amount)}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-gold-600 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium text-gray-600">{formatCurrency(b.total_amount)}</td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-green-700">{formatCurrency(b.advance_amount)}</td>
                          <td className={`py-4 px-6 text-right font-mono font-bold ${remaining > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {formatCurrency(remaining)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                ${b.booking_status === 'active' ? 'bg-gold-100 text-gold-700' :
                                b.booking_status === 'delivered' || b.booking_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                              }
                              `}>
                              {b.booking_status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button title="Print" onClick={() => handleOpenPrintPreview(b)} className="p-1 hover:text-charcoal-900"><Printer size={16} /></button>
                              <button title="Edit" onClick={() => handleEditBooking(b)} className="p-1 hover:text-blue-600"><Edit2 size={16} /></button>
                              <button title="Delete" onClick={() => handleDeleteBooking(b.id)} className="p-1 hover:text-red-600"><Trash2 size={16} /></button>
                              {b.booking_status === 'active' && (
                                <button title="Mark Delivered" onClick={() => handleUpdateStatus(b.id, 'delivered')} className="p-1 hover:text-green-600"><CheckCircle size={16} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-6">Trans ID</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Booking Ref</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Mode</th>
                    <th className="py-3 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-xs">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-3 px-6 font-bold text-gray-500">TRN-{b.id}</td>
                      <td className="py-3 px-6">{formatDate(b.booking_date)}</td>
                      <td className="py-3 px-6 text-gold-600 font-bold">{b.bills?.bill_no}</td>
                      <td className="py-3 px-6"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold uppercase text-[10px]">ADVANCE DEPOSIT</span></td>
                      <td className="py-3 px-6 uppercase font-bold text-gray-600">CASH / UPI</td>
                      <td className="py-3 px-6 text-right font-bold text-green-700">{formatCurrency(b.advance_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE / EDIT BOOKING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2A26]/80 backdrop-blur-sm flex items-center justify-center p-4 print-hidden print:hidden">
          <div className="bg-white w-full max-w-[95vw] h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="bg-[#2D2A26] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500 text-[#2D2A26] flex items-center justify-center font-bold">
                  {editingBookingId ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <h3 className="font-serif text-lg tracking-wide">{editingBookingId ? 'Edit Order Booking' : 'New Order Booking'}</h3>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingBookingId(null); setSelectedCustomer(null); setItems([]); setAdvanceInput(''); setManualTotal(''); setDeliveryDate(''); setNotes(''); setSaleType('GST'); }} className="text-gray-400 hover:text-white"><XCircle size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 grid grid-cols-12 gap-8 bg-gray-50/50">
              <div className="col-span-8 flex flex-col gap-6">
                {/* CUSTOMER & DELIVERY SECTION */}
                <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2"><User size={14} /> Customer Details & Delivery</h4>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="relative">
                      {!selectedCustomer && !isAddingCustomer ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input 
                              label="Customer Phone Number *" 
                              placeholder="Type Phone to Search / Auto-fill..." 
                              value={customerSearch} 
                              onChange={e => handlePhoneInputChange(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCustomerSearch(); } }} 
                              icon={<Search size={16} />} 
                            />
                            <Button size="sm" className="mt-6" onClick={handleCustomerSearch}>Search</Button>
                          </div>

                          {foundCustomers.length > 0 && (
                            <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                              <div className="max-h-48 overflow-y-auto">
                                {foundCustomers.map(cust => (
                                  <div 
                                    key={cust.id} 
                                    onClick={() => { setSelectedCustomer(cust); setFoundCustomers([]); setCustomerSearch(''); }} 
                                    className="p-3 hover:bg-gold-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-charcoal-900">{cust.name}</span>
                                      <span className="text-xs font-mono text-gray-400">{cust.phone}</span>
                                    </div>
                                    {cust.address && <p className="text-[10px] text-gray-500 truncate mt-0.5">{cust.address}</p>}
                                  </div>
                                ))}
                              </div>
                              <div 
                                className="bg-gray-50 p-2 text-center border-t border-gray-100 cursor-pointer" 
                                onClick={() => { setIsAddingCustomer(true); setNewCustomerDetails({ name: '', phone: customerSearch, address: '' }); setFoundCustomers([]); }}
                              >
                                <button className="text-[10px] font-bold text-gold-600 hover:text-gold-700 uppercase tracking-widest">+ Add New Customer Direct</button>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => { setIsAddingCustomer(true); setNewCustomerDetails({ name: '', phone: customerSearch, address: '' }); }}
                            className="text-[11px] font-bold text-gold-600 hover:underline uppercase tracking-wider flex items-center gap-1"
                          >
                            + Enter New Customer Details
                          </button>
                        </div>
                      ) : isAddingCustomer ? (
                        <div className="bg-gold-50/50 p-4 rounded-lg border border-gold-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-bold text-gold-700 flex items-center gap-2"><UserPlus size={14} /> New Customer Entry</p>
                          <div className="space-y-3">
                            <Input label="Full Name *" placeholder="Customer Name" value={newCustomerDetails.name} onChange={e => setNewCustomerDetails({ ...newCustomerDetails, name: e.target.value })} />
                            <Input label="Phone Number *" placeholder="Phone Number" value={newCustomerDetails.phone} onChange={e => setNewCustomerDetails({ ...newCustomerDetails, phone: e.target.value })} />
                            <Input label="Showroom / City Address" placeholder="Address (Optional)" value={newCustomerDetails.address} onChange={e => setNewCustomerDetails({ ...newCustomerDetails, address: e.target.value })} />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingCustomer(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleConfirmNewCustomer}>Confirm & Link Customer</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#2D2A26] text-white rounded-lg text-sm flex justify-between items-center shadow-lg">
                          <div>
                            <p className="font-bold text-base text-gold-400">{selectedCustomer?.name}</p>
                            <p className="text-xs opacity-80 font-mono">📱 {selectedCustomer?.phone}</p>
                            {selectedCustomer?.address && <p className="text-xs opacity-60 italic mt-1">📍 {selectedCustomer.address}</p>}
                          </div>
                          <button onClick={() => setSelectedCustomer(null)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white font-bold transition-all">Change</button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Input label="Expected Delivery Date *" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* ORDER REQUIREMENTS & ITEMS */}
                <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2"><ShoppingBag size={14} /> Order Requirements & Tax Mode</h4>
                    
                    {/* GST (3%) vs NON-GST TOGGLE */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                      <span className="text-[10px] font-bold text-gray-500 uppercase px-1">Bill Tax Mode:</span>
                      <button
                        type="button"
                        onClick={() => setSaleType('GST')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${saleType === 'GST' ? 'bg-gold-500 text-white shadow-md' : 'text-gray-500 hover:text-charcoal-900'}`}
                      >
                        GST (3%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleType('NON GST')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${saleType === 'NON GST' ? 'bg-charcoal-900 text-white shadow-md' : 'text-gray-500 hover:text-charcoal-900'}`}
                      >
                        NON-GST (0%)
                      </button>
                    </div>
                  </div>

                  {/* ADD ITEM INPUT ROW */}
                  <div className="grid grid-cols-12 gap-3 mb-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="col-span-3">
                      <Input label="Item Name *" placeholder="e.g. Ring / Bangle" value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                    </div>
                    
                    <div className="col-span-2">
                      <Select label="Purity" options={[
                        { value: '24K (Pure)', label: '24K (Pure)' },
                        { value: '22K (916)', label: '22K (916)' },
                        { value: '18K (750)', label: '18K (750)' },
                        { value: '14K (585)', label: '14K (585)' },
                        { value: 'Silver (925)', label: 'Silver (925)' },
                        { value: 'Silver (70)', label: 'Silver (70)' },
                        { value: 'Selam', label: 'Selam' }
                      ]} value={newItem.purity} onChange={e => {
                        const newPurity = e.target.value;
                        let newRate = 0;
                        if (metalRates) {
                          if (newPurity.includes('22K') || newPurity.includes('916')) newRate = metalRates.gold22k;
                          else if (newPurity.includes('18K') || newPurity.includes('750')) newRate = metalRates.gold18k;
                          else if (newPurity.includes('24K') || newPurity.includes('Pure')) newRate = metalRates.goldStd;
                        }
                        setNewItem({ ...newItem, purity: newPurity, rate: newRate || newItem.rate });
                      }} />
                    </div>
                    
                    <div className="col-span-2">
                      <Input label="Weight (g) *" type="number" isMonospaced value={newItem.weight || ''} onChange={e => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })} />
                    </div>
                    
                    <div className="col-span-2">
                      <Input label="Rate / g *" type="number" isMonospaced value={newItem.rate || ''} onChange={e => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    
                    <div className="col-span-3 flex items-end gap-1">
                      <div className="flex-1">
                        <Input
                          label={`Making Charges (${newItem.makingChargesType === 'pct' ? '%' : '₹'})`}
                          type="number"
                          isMonospaced
                          placeholder={newItem.makingChargesType === 'pct' ? '12' : '500'}
                          value={newItem.makingChargesInput || ''}
                          onChange={e => setNewItem({ ...newItem, makingChargesInput: e.target.value })}
                        />
                      </div>
                      
                      <select
                        value={newItem.makingChargesType || 'amt'}
                        onChange={e => setNewItem({ ...newItem, makingChargesType: e.target.value as 'amt' | 'pct' })}
                        className="bg-white border border-gray-300 text-[11px] font-bold rounded-lg px-2 py-2.5 outline-none cursor-pointer text-charcoal-900 shadow-sm"
                      >
                        <option value="amt">₹ (Amt)</option>
                        <option value="pct">% (Pct)</option>
                      </select>

                      <Button size="sm" onClick={handleAddItem} className="h-10 px-3 shrink-0">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* LIVE COMPUTED PREVIEW ROW */}
                  {(newItem.weight > 0 && newItem.rate > 0) && (
                    <div className="mb-4 p-2 bg-gold-50 border border-gold-200 rounded flex justify-between items-center text-xs font-mono">
                      <span>Base Value: <strong>{formatCurrency(newItem.weight * newItem.rate)}</strong></span>
                      <span>Making Charges ({newItem.makingChargesType === 'pct' ? `${newItem.makingChargesInput}%` : '₹'}): <strong>{formatCurrency(previewNewItemMC)}</strong></span>
                      <span className="text-gold-700 font-bold text-sm">Line Total: {formatCurrency(previewNewItemLineTotal)}</span>
                    </div>
                  )}

                  {/* ITEMS TABLE */}
                  <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px] tracking-wider sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3">Purity</th>
                          <th className="py-2.5 px-3 text-right">Weight (g)</th>
                          <th className="py-2.5 px-3 text-right">Rate / g</th>
                          <th className="py-2.5 px-3 text-right">Making Charges</th>
                          <th className="py-2.5 px-3 text-right">Total Amount</th>
                          <th className="py-2.5 px-3 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-400 font-sans italic text-xs">
                              No items added to this order booking yet. Add items above.
                            </td>
                          </tr>
                        ) : (
                          items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-sans font-bold text-charcoal-900">{item.name}</td>
                              <td className="py-2.5 px-3 font-sans font-medium text-gold-700">{item.purity}</td>
                              <td className="py-2.5 px-3 text-right">{item.weight.toFixed(3)} g</td>
                              <td className="py-2.5 px-3 text-right">₹ {item.rate.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-right text-gray-600">
                                {item.makingChargesType === 'pct' ? `${item.makingChargesInput}% (` : ''}₹ {item.makingCharges.toLocaleString()}{item.makingChargesType === 'pct' ? ')' : ''}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-charcoal-900">{formatCurrency(item.lineTotal)}</td>
                              <td className="py-2.5 px-3 text-center">
                                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-gray-400 hover:text-red-600"><X size={14} /></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* FINANCIAL SUMMARY & ADVANCE PAYMENT PANEL */}
              <div className="col-span-4 flex flex-col gap-6">
                <div className="bg-[#2D2A26] p-6 rounded-t-lg text-white shadow-xl">
                  <h4 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-4">Financial Summary</h4>
                  
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                    <span className="text-sm font-medium">Price Lock Mode</span>
                    <button 
                      onClick={() => setIsPriceLocked(!isPriceLocked)} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isPriceLocked ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {isPriceLocked ? <Lock size={12} /> : <Unlock size={12} />}
                      {isPriceLocked ? 'LOCKED' : 'ESTIMATE'}
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Items Subtotal</span>
                      <span>{formatCurrency(itemsTotal)}</span>
                    </div>

                    {saleType === 'GST' ? (
                      <div className="flex justify-between text-gold-400">
                        <span>GST (3%)</span>
                        <span>+ {formatCurrency(gstAmount)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-gray-400 text-xs italic">
                        <span>Tax Mode</span>
                        <span className="text-gray-500">NON-GST (0%)</span>
                      </div>
                    )}

                    {oldGoldValue > 0 && (
                      <div className="flex justify-between text-pink-300">
                        <span>Less: Old Gold Scrap</span>
                        <span>- {formatCurrency(oldGoldValue)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-700">
                      <span className="font-sans font-bold text-white">Grand Total</span>
                      {isPriceLocked ? (
                        <div className="w-36">
                          <input 
                            type="number" 
                            className="w-full bg-gray-800 border border-gold-500/50 rounded px-2 py-1 text-right text-gold-400 font-bold focus:outline-none focus:border-gold-500 text-lg" 
                            value={manualTotal} 
                            onChange={e => setManualTotal(e.target.value)} 
                          />
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gold-400">{formatCurrency(calculatedGrandTotal)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-b-lg border border-gray-200 border-t-0 flex-1 flex flex-col shadow-lg">
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Advance Deposit Received *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-4 rounded-lg border border-gray-300 font-mono font-bold text-2xl text-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none shadow-inner" 
                          placeholder="0.00" 
                          value={advanceInput} 
                          onChange={e => setAdvanceInput(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="text-xs font-bold text-red-500 uppercase">Remaining Balance Due</span>
                      <span className="font-mono font-bold text-xl text-red-600">{formatCurrency(balanceDue)}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Customer Notes / Specific Design Instructions</label>
                      <textarea 
                        rows={2} 
                        placeholder="Specific gold weight constraints or instructions..." 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-xs outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button fullWidth onClick={handleCreateBooking} className="h-14 text-lg shadow-xl hover:translate-y-[-2px] transition-transform">
                      {editingBookingId ? 'Update Order Booking' : 'Confirm Order Booking'}
                    </Button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-1">
                      <AlertCircle size={12} /> Printable A5 receipt generated on confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT COMPONENTS (STRICTLY FOR PRINTER) */}
      <div className="hidden print:block print-block">
        {selectedBookingForPrint && (
          <AdvanceBookingPrint
            bookingNo={selectedBookingForPrint.bills?.bill_no || '-'}
            bookingDate={selectedBookingForPrint.booking_date}
            deliveryDate={selectedBookingForPrint.delivery_date}
            customerName={selectedBookingForPrint.bills?.customers?.name || 'Unknown'}
            customerPhone={selectedBookingForPrint.bills?.customers?.phone || '-'}
            customerAddress={selectedBookingForPrint.bills?.customers?.address || ''}
            saleType={selectedBookingForPrint.bills?.sale_type === 'nongst' ? 'NON GST' : (selectedBookingForPrint.saleType || 'GST')}
            subtotal={selectedBookingForPrint.subtotal || selectedBookingForPrint.bills?.subtotal || 0}
            gstAmount={selectedBookingForPrint.gstAmount || selectedBookingForPrint.bills?.gst_amount || 0}
            oldGoldAmount={selectedBookingForPrint.oldGoldAmount || 0}
            items={selectedBookingForPrint.structuredItems || []}
            itemDescription={selectedBookingForPrint.item_description}
            totalAmount={selectedBookingForPrint.total_amount}
            advanceAmount={selectedBookingForPrint.advance_amount}
            balanceDue={selectedBookingForPrint.total_amount - selectedBookingForPrint.advance_amount}
            notes={selectedBookingForPrint.customer_notes}
          />
        )}
      </div>

      {/* ON-SCREEN PREVIEW MODAL */}
      {showPrintPreview && selectedBookingForPrint && (
        <div className="fixed inset-0 z-[100] bg-charcoal-900/80 backdrop-blur-md flex items-center justify-center p-8 print-hidden print:hidden">
          <div className="bg-gray-100 w-full max-w-[1000px] h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="bg-charcoal-900 px-8 py-5 flex justify-between items-center text-white shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center font-bold"><Eye size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg tracking-wide uppercase">Order Preview</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Verifying order booking receipt before printing</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleActualPrint} variant="secondary" className="bg-gold-500 text-charcoal-900 border-none hover:bg-gold-600 shadow-xl"><Printer size={18} className="mr-2" /> Send to Printer</Button>
                <button onClick={() => setShowPrintPreview(false)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/10 rounded-full"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 p-8 custom-scrollbar">
              <div className="scale-90 origin-top">
                <AdvanceBookingPrint
                  isScreenPreview
                  bookingNo={selectedBookingForPrint.bills?.bill_no || '-'}
                  bookingDate={selectedBookingForPrint.booking_date}
                  deliveryDate={selectedBookingForPrint.delivery_date}
                  customerName={selectedBookingForPrint.bills?.customers?.name || 'Unknown'}
                  customerPhone={selectedBookingForPrint.bills?.customers?.phone || '-'}
                  customerAddress={selectedBookingForPrint.bills?.customers?.address || ''}
                  saleType={selectedBookingForPrint.bills?.sale_type === 'nongst' ? 'NON GST' : (selectedBookingForPrint.saleType || 'GST')}
                  subtotal={selectedBookingForPrint.subtotal || selectedBookingForPrint.bills?.subtotal || 0}
                  gstAmount={selectedBookingForPrint.gstAmount || selectedBookingForPrint.bills?.gst_amount || 0}
                  oldGoldAmount={selectedBookingForPrint.oldGoldAmount || 0}
                  items={selectedBookingForPrint.structuredItems || []}
                  itemDescription={selectedBookingForPrint.item_description}
                  totalAmount={selectedBookingForPrint.total_amount}
                  advanceAmount={selectedBookingForPrint.advance_amount}
                  balanceDue={selectedBookingForPrint.total_amount - selectedBookingForPrint.advance_amount}
                  notes={selectedBookingForPrint.customer_notes}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
