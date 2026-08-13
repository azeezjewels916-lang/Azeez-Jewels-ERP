
import React from 'react';

interface LayawayTransaction {
  id: string;
  date: string;
  amount: number;
  mode: string;
  reference?: string;
  notes?: string;
}

interface LayawayStatementPrintProps {
  billNo: string;
  billDate: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  transactions: LayawayTransaction[];
  isScreenPreview?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

export const LayawayStatementPrint: React.FC<LayawayStatementPrintProps> = ({
  billNo,
  billDate,
  customerName,
  customerPhone,
  totalAmount,
  paidAmount,
  balance,
  transactions,
  isScreenPreview = false
}) => {
  return (
    <div className={`${isScreenPreview ? 'block w-[148mm] mx-auto shadow-2xl p-4 my-8' : 'hidden print:block w-[148mm] h-[210mm] mx-auto p-4'} bg-white text-charcoal-900 font-sans font-bold flex flex-col`}>
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
        <div className="w-28 h-28 relative flex items-center justify-center -mt-6">
           <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        
        <div className="text-center w-full -mt-2">
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tighter leading-none mb-1">MAYAKKA JEWELLERS</h1>
          <div className="text-[10px] text-charcoal-800 leading-tight font-bold space-y-0.5">
             <p>#312, Jumma Masjid Road, (O.P.H Road), Bengaluru – 560051</p>
             <p className="text-xs">Ph: 99009 54791, 94491 19542</p>
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
         <h3 className="text-xs font-bold tracking-widest uppercase">Layaway Statement</h3>
         <div className="flex gap-4 font-mono text-[10px]">
            <p>BILL NO: {billNo}</p>
            <p>DATE: {formatDate(new Date().toISOString())}</p>
         </div>
      </div>

      {/* CUSTOMER & BILL SUMMARY */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="border-l-2 border-gold-500/20 pl-2 py-0.5">
          <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-0.5 italic">Customer Details</h3>
          <div className="text-xs">
            <p className="font-bold font-serif text-charcoal-900 tracking-tight">{customerName}</p>
            <p className="font-mono text-gray-600 text-[9px]">{customerPhone}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-1.5 rounded border border-gray-100 flex flex-col items-end justify-center">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Bill Date</p>
            <p className="font-mono text-[10px] font-bold text-charcoal-900">{formatDate(billDate)}</p>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        <div className="bg-charcoal-900 text-white p-2 rounded-sm">
          <p className="text-[7px] uppercase font-bold text-gold-500 tracking-widest mb-1">Total Value</p>
          <p className="text-sm font-mono font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-green-50 border border-green-100 p-2 rounded-sm">
          <p className="text-[7px] uppercase font-bold text-green-600 tracking-widest mb-1">Total Paid</p>
          <p className="text-sm font-mono font-bold text-green-700">{formatCurrency(paidAmount)}</p>
        </div>
        <div className={`${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-gold-50 border-gold-100'} p-2 rounded-sm border`}>
          <p className={`text-[7px] uppercase font-bold tracking-widest mb-1 ${balance > 0 ? 'text-red-600' : 'text-gold-600'}`}>Balance Due</p>
          <p className={`text-sm font-mono font-bold ${balance > 0 ? 'text-red-700' : 'text-gold-700'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="flex-1 mb-4">
        <h3 className="text-[9px] font-bold text-charcoal-900 uppercase tracking-[0.2em] mb-3 border-b border-charcoal-900 pb-1">Payment History</h3>
        <table className="w-full text-left text-[9px] border-collapse border border-charcoal-900">
          <thead>
            <tr className="bg-white">
              <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 w-8 border border-charcoal-900">Sn</th>
              <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 border border-charcoal-900">Date</th>
              <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 border border-charcoal-900">Reference / Mode</th>
              <th className="py-1 px-1 font-bold uppercase tracking-wider text-charcoal-900 text-right border border-charcoal-900">Amount Paid</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={4} className="py-8 text-center text-charcoal-900 italic border border-charcoal-900">No payments recorded.</td>
                </tr>
            ) : (
                transactions.map((tx, idx) => (
                    <tr key={tx.id}>
                      <td className="py-1 px-1 text-charcoal-900 border border-charcoal-900">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-1 px-1 font-sans border border-charcoal-900">{formatDate(tx.date)}</td>
                      <td className="py-1 px-1 border border-charcoal-900">
                        <span className="font-bold text-charcoal-900 block tracking-tight uppercase text-[9px]">{tx.mode}</span>
                        <span className="text-[8px] text-charcoal-900 font-medium italic">{tx.reference || 'N/A'}</span>
                      </td>
                      <td className="py-1 px-1 text-right text-green-700 font-bold border border-charcoal-900">{formatCurrency(tx.amount)}</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="border-t border-charcoal-900 pt-3">
          <div className="grid grid-cols-2 gap-4 mb-3">
             <div className="text-[7px] text-charcoal-900 leading-tight">
                <p className="font-bold uppercase mb-0.5">Note:</p>
                <p>This is a payment summary for your layaway purchase.</p>
                <p>Please keep this for your records.</p>
             </div>
             <div className="text-[7px] text-charcoal-900 text-right leading-tight">
                <p className="font-bold uppercase mb-0.5">Status:</p>
                <p className="font-bold text-charcoal-900 uppercase">
                    {balance <= 0 ? 'FULLY PAID' : 'PARTIALLY PAID'}
                </p>
             </div>
          </div>

          <div className="flex justify-between items-end mt-4">
              <div className="text-center w-32 border-t border-charcoal-900 pt-1">
                 <p className="text-[8px] uppercase font-bold text-charcoal-900">Customer</p>
              </div>
              <div className="text-center w-40 border-t border-charcoal-900 pt-1">
                 <p className="text-[9px] uppercase font-bold text-charcoal-900">MAYAKKA JEWELLERS</p>
              </div>
          </div>
      </div>
      
      <div className="mt-4 text-center text-[8px] text-gray-300 uppercase tracking-[0.5em] font-light italic">
         Luxury Redefined • Est 2024
      </div>
    </div>
  );
};
