
import React from 'react';

interface BookingItem {
  id: string;
  name: string;
  metalType: string;
  weight: number;
  purity: string;
  rate: number;
  makingCharges: number;
  lineTotal: number;
}

interface AdvanceBookingPrintProps {
  bookingNo: string;
  bookingDate: string;
  deliveryDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  saleType?: string;
  subtotal?: number;
  gstAmount?: number;
  oldGoldAmount?: number;
  items: BookingItem[];
  itemDescription?: string;
  totalAmount: number;
  advanceAmount: number;
  balanceDue: number;
  notes?: string;
  isScreenPreview?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

export const AdvanceBookingPrint: React.FC<AdvanceBookingPrintProps> = ({
  bookingNo,
  bookingDate,
  deliveryDate,
  customerName,
  customerPhone,
  customerAddress,
  saleType = 'GST',
  subtotal = 0,
  gstAmount = 0,
  oldGoldAmount = 0,
  items,
  itemDescription,
  totalAmount,
  advanceAmount,
  balanceDue,
  notes,
  isScreenPreview = false
}) => {
  const calcSubtotal = subtotal || items.reduce((s, i) => s + (i.lineTotal || 0), 0);
  const calcGst = gstAmount || (saleType.toUpperCase() === 'GST' ? calcSubtotal * 0.03 : 0);

  return (
    <div className={`${isScreenPreview ? 'block w-[148mm] max-h-[208mm] mx-auto shadow-2xl p-4 my-8' : 'hidden print:block w-[148mm] max-h-[208mm] mx-auto p-4'} bg-white text-charcoal-900 font-sans font-bold flex flex-col border-2 border-charcoal-900 box-border relative overflow-hidden`}>
      {/* BRAND WATERMARK LOGO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.035] select-none">
        <div className="text-center">
          <div className="text-[130px] font-serif font-bold text-charcoal-900 leading-none tracking-tighter">AHS</div>
          <div className="text-2xl font-serif font-bold uppercase tracking-[0.3em] text-charcoal-900 mt-2">AZEEZ JEWELS</div>
        </div>
      </div>
      <style>{`
        @media print {
          @page { margin: 0; size: A5 portrait; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; font-weight: bold !important; }
          .no-print { display: none !important; }
          * { font-weight: bold !important; }
        }
      `}</style>

      {/* HEADER - CENTERED */}
      <div className="flex flex-col items-center mb-1 border-b-2 border-charcoal-900 pb-1 relative">
        {/* LOGO - LARGER AND CENTERED */}
        <div className="w-24 h-24 relative flex items-center justify-center -mt-4">
           <img src="/logowithoutbg.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        
        <div className="text-center w-full -mt-2">
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tighter leading-none mb-1">AZEEZ JEWELS</h1>
          <div className="text-[10px] text-charcoal-800 leading-tight font-bold space-y-0.5">
             <p className="text-[11px] font-bold text-gold-600">Dealers in : 22 Ct. 916 KDM Gold Silver Ornaments</p>
             <p>#324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051</p>
             <p className="text-xs">Prop: Azmathulla Khan — Mobile: 9916667573</p>
             <p className="text-[10px] mt-0.5 underline decoration-1">GSTIN: 29BBGPM2303C1Z4</p>
          </div>
        </div>

        <div className="absolute top-0 right-0">
           <div className="w-10 h-10">
              <img src="/BIS_PNG.png" alt="BIS Hallmark" className="max-w-full max-h-full object-contain" />
           </div>
        </div>
      </div>

      {/* INFO BAR */}
      <div className="flex justify-between items-center bg-charcoal-900 text-white px-3 py-1 mb-2 rounded-sm">
         <h3 className="text-xs font-bold tracking-widest uppercase">Order Booking Receipt ({saleType.toUpperCase()})</h3>
         <div className="flex gap-4 font-mono text-[10px]">
            <p>NO: {bookingNo}</p>
            <p>DATE: {formatDate(bookingDate)}</p>
         </div>
      </div>

      {/* CUSTOMER & DELIVERY INFO */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="border-l-2 border-gold-500/20 pl-2 py-0.5">
          <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5 italic">Customer Details</h3>
          <div className="text-xs">
            <p className="font-bold font-serif text-charcoal-900 tracking-tight">{customerName || 'Walk-in Customer'}</p>
            <p className="font-mono text-gray-600 text-[9px]">{customerPhone}</p>
            {customerAddress && <p className="text-[9px] text-gray-600 font-sans truncate">{customerAddress}</p>}
          </div>
        </div>
        
        <div className="bg-gold-50 p-1.5 rounded border border-gold-100 flex flex-col items-end justify-center">
            <p className="text-[7px] font-bold text-gold-600 uppercase tracking-widest mb-0.5">Expected Delivery</p>
            <p className="font-mono text-[10px] font-bold text-charcoal-900">{formatDate(deliveryDate)}</p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="flex-1 mb-3">
        <h3 className="text-[9px] font-bold text-charcoal-900 uppercase tracking-[0.2em] mb-2 border-b border-charcoal-900 pb-1">Order Requirements</h3>
        {items && items.length > 0 ? (
          <table className="w-full text-left text-[9px] border-collapse border border-charcoal-900">
            <thead>
              <tr className="bg-white">
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 w-8 border border-charcoal-900">Sn</th>
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 border border-charcoal-900">Description</th>
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 text-right border border-charcoal-900">Wt(g)</th>
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 text-right border border-charcoal-900">Rate</th>
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 text-right border border-charcoal-900">MC</th>
                <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 text-right border border-charcoal-900">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-1 px-1 text-charcoal-900 border border-charcoal-900">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-1 px-1 font-sans border border-charcoal-900">
                    <span className="font-bold text-charcoal-900 block tracking-tight uppercase text-[9px]">{item.name} ({item.purity})</span>
                  </td>
                  <td className="py-1 px-1 text-right text-charcoal-900 border border-charcoal-900">{item.weight.toFixed(3)}</td>
                  <td className="py-1 px-1 text-right text-charcoal-900 border border-charcoal-900">{item.rate.toLocaleString()}</td>
                  <td className="py-1 px-1 text-right text-charcoal-900 border border-charcoal-900">{(item as any).makingChargesType === 'pct' ? `${(item as any).makingChargesInput}%` : `₹${item.makingCharges ? item.makingCharges.toLocaleString() : '0'}`}</td>
                  <td className="py-1 px-1 text-right text-charcoal-900 font-bold border border-charcoal-900">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 bg-gray-50 rounded border border-gray-100">
            <p className="text-[10px] text-charcoal-800 font-medium leading-relaxed">
              {itemDescription || 'No detailed items listed.'}
            </p>
          </div>
        )}
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="space-y-1 mb-4 text-xs font-mono border-t border-b border-charcoal-900 py-2">
        <div className="flex justify-between">
          <span className="font-sans font-bold">Subtotal:</span>
          <span>₹ {calcSubtotal.toLocaleString()}</span>
        </div>
        {saleType.toUpperCase() === 'GST' && (
          <div className="flex justify-between text-gray-700">
            <span className="font-sans">GST (3%):</span>
            <span>+ ₹ {calcGst.toLocaleString()}</span>
          </div>
        )}
        {oldGoldAmount > 0 && (
          <div className="flex justify-between text-rose-700">
            <span className="font-sans">Less Old Gold:</span>
            <span>- ₹ {oldGoldAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-charcoal-900 border-t border-gray-300 pt-1">
          <span className="font-sans uppercase">Total Order Value:</span>
          <span className="text-sm">₹ {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-green-700">
          <span className="font-sans uppercase">Advance Paid:</span>
          <span>₹ {advanceAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-rose-700 border-t border-gray-200 pt-1">
          <span className="font-sans uppercase">Balance Due:</span>
          <span className="text-sm">₹ {balanceDue.toLocaleString()}</span>
        </div>
      </div>

      {/* NOTES */}
      {notes && (
        <div className="mb-6 p-2 bg-gray-50 rounded border border-gray-100">
           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Notes / Instructions</p>
           <p className="text-[9px] text-charcoal-700 italic leading-relaxed">{notes}</p>
        </div>
      )}

      {/* FOOTER */}
      <div className="border-t border-charcoal-900 pt-3">
          <div className="grid grid-cols-2 gap-4 mb-3">
             <div className="text-[7px] text-charcoal-900 leading-tight">
                <p className="font-bold uppercase mb-0.5">Note:</p>
                <p>This is an order booking receipt. Final invoice will be generated at the time of delivery.</p>
                <p>Prices are subject to metal rate fluctuations unless price is locked.</p>
             </div>
             <div className="text-[7px] text-charcoal-900 text-right leading-tight">
                <p className="font-bold uppercase mb-0.5">Status:</p>
                <p className="font-bold text-charcoal-900 uppercase">ORDER BOOKING CONFIRMED</p>
             </div>
          </div>

          <div className="flex justify-between items-end mt-4">
              <div className="text-center w-32 border-t border-charcoal-900 pt-1">
                 <p className="text-[8px] uppercase font-bold text-charcoal-900">Customer Signature</p>
              </div>
              <div className="text-center w-40 border-t border-charcoal-900 pt-1">
                 <p className="text-[9px] uppercase font-bold text-charcoal-900">For AZEEZ JEWELS</p>
              </div>
          </div>
      </div>
      
      <div className="mt-4 text-center text-[8px] text-gray-300 uppercase tracking-[0.5em] font-light italic">
         Luxury Redefined • Est 2024
      </div>
    </div>
  );
};
