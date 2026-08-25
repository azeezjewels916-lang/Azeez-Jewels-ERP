
import React from 'react';
import { BillItem, Customer, PaymentRecord } from '../types';

interface InvoicePrintProps {
  billNo: string;
  billDate: string;
  saleType: 'GST' | 'NON GST';
  customer: Customer | null;
  items: BillItem[];
  allMetalRates: Record<string, number>;
  totals: {
    itemsSubtotal: number;
    baseTaxable: number;
    gstAmount: number;
    grandTotal: number;
  };
  oldGold: {
    weight: number;
    purity: number | string;
    rate: number;
    total: number;
    description?: string;
  };
  mcValueAdded: {
    weight: number;
    rate: number;
    total: number;
  };
  paymentMethods: PaymentRecord[];
  isScreenPreview?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return new Date().toLocaleDateString('en-GB');
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

const numberToWords = (num: number): string => {
  return `Rupees ${num.toFixed(0)} Only`;
};

const metalLabels: Record<string, string> = {
  'gold': '24K (Pure)',
  'gold_916': '22K (916)',
  'gold_750': '18K (750)',
  'gold_585': '14K (585)',
  'silver_92': 'Silver (925)',
  'silver_70': 'Silver (70)',
  'selam_silver': 'Selam',
  'service': 'Service'
};

export const InvoicePrint: React.FC<InvoicePrintProps> = ({
  billNo,
  billDate,
  saleType,
  customer,
  items,
  allMetalRates,
  totals,
  oldGold,
  mcValueAdded,
  paymentMethods,
  isScreenPreview = false
}) => {

  const cgst = saleType === 'GST' ? totals.gstAmount / 2 : 0;
  const sgst = saleType === 'GST' ? totals.gstAmount / 2 : 0;

  // Only show rates for metals present in the bill
  const activeMetals = Array.from(new Set(items.map(i => i.metal_type).filter(m => m && m !== 'service'))) as string[];

  return (
    <div className={`${isScreenPreview ? 'block w-[148mm] max-h-[208mm] mx-auto shadow-2xl p-4 my-8' : 'hidden print:block w-[148mm] max-h-[208mm] mx-auto p-4'} bg-white text-charcoal-900 font-sans font-bold flex flex-col border-2 border-charcoal-900 box-border relative overflow-hidden`}>
      {/* BRAND WATERMARK LOGO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.035] select-none">
        <div className="text-center">
          <div className="text-[130px] font-serif font-bold text-charcoal-900 leading-none tracking-tighter">AJ</div>
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

      {/* LUXURY HEADER WITH ICON - CENTERED */}
      <div className="flex flex-col items-center mb-1 border-b-2 border-charcoal-900 pb-1 relative">
        {/* LOGO - LARGER AND CENTERED */}
        <div className="w-28 h-28 relative flex items-center justify-center -mt-6">
          <img src="/logowithoutbg.png" alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="text-center w-full -mt-2">
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 tracking-tighter leading-none mb-1">AZEEZ JEWELS</h1>
          <div className="text-[10px] text-charcoal-800 leading-tight font-bold space-y-0.5">
            <p className="text-[11px] font-bold text-gold-600">Dealers in : 22 Ct. 916 KDM Gold Silver Ornaments</p>
            <p>#324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051</p>
            <p className="text-xs">Prop: Azmathulla Khan — Mobile: 9916667573</p>
            {saleType === 'GST' && <p className="text-[10px] mt-0.5 underline decoration-1">GSTIN: 29BBGPM2303C1Z4</p>}
          </div>
        </div>

        {/* Floating elements moved or integrated */}
        <div className="absolute top-0 right-0 text-right">
          <div className="w-10 h-10">
            <img src="/BIS_PNG.png" alt="BIS Hallmark" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>

      {/* BILL INFO BAR */}
      <div className="flex justify-between items-center bg-charcoal-900 text-white px-3 py-1 mb-2 rounded-sm">
        <h3 className="text-xs font-bold tracking-widest">{saleType === 'GST' ? 'TAX INVOICE' : 'RETAIL INVOICE'}</h3>
        <div className="flex gap-4 font-mono text-[10px]">
          <p>NO: {billNo}</p>
          <p>DATE: {formatDate(billDate)}</p>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div className="grid grid-cols-2 gap-2 mb-2 border border-charcoal-900 p-1.5 rounded-sm">
        <div>
          <h3 className="text-[8px] font-bold text-charcoal-900 uppercase tracking-widest mb-0.5">Customer Details</h3>
          <div className="text-xs">
            <p className="font-bold text-charcoal-900">{customer?.name || 'Walk-in Customer'}</p>
            <p className="font-mono text-[10px] text-charcoal-700">{customer?.phone}</p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center">
          {activeMetals.length > 0 && (
            <div className="flex gap-2 uppercase font-bold text-[9px] text-charcoal-900">
              {activeMetals.map((m) => (
                <div key={m} className="text-right">
                  <span className="text-[7px] text-charcoal-900 block">{metalLabels[m || ''] || m} RATE</span>
                  <span>₹{(allMetalRates[m || ''] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="flex-1 mb-4 overflow-hidden">
        <table className="w-full text-left text-[9px] border-collapse border border-charcoal-900">
          <thead>
            <tr className="bg-white">
              <th className="py-1 px-1 font-bold uppercase w-8 border border-charcoal-900">Sn</th>
              <th className="py-1 px-1 font-bold uppercase border border-charcoal-900">Description</th>
              <th className="py-1 px-1 font-bold uppercase border border-charcoal-900">HUID</th>
              <th className="py-1 px-1 font-bold uppercase text-right border border-charcoal-900">Gross Wt</th>
              <th className="py-1 px-1 font-bold uppercase text-right border border-charcoal-900">Net Wt</th>
              <th className="py-1 px-1 font-bold uppercase text-right border border-charcoal-900">Rate</th>
              <th className="py-1 px-1 font-bold uppercase text-right border border-charcoal-900">MC</th>
              <th className="py-1 px-1 font-bold uppercase text-right border border-charcoal-900">Total</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td className="py-1 px-1 border border-charcoal-900">{idx + 1}</td>
                <td className="py-1 px-1 uppercase border border-charcoal-900">{item.item_name}</td>
                <td className="py-1 px-1 font-mono uppercase text-[8px] border border-charcoal-900">{item.huid || '-'}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{item.gross_weight?.toFixed(3) || item.weight.toFixed(3)}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{item.net_weight?.toFixed(3) || item.weight.toFixed(3)}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{item.rate.toLocaleString()}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{item.making_charges.toLocaleString()}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{item.line_total.toLocaleString()}</td>
              </tr>
            ))}

            {mcValueAdded.total > 0 && (
              <tr className="bg-white">
                <td className="py-1 px-1 border border-charcoal-900">{items.length + 1}</td>
                <td colSpan={2} className="py-1 px-1 uppercase border border-charcoal-900">Value Added / Service MC</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">-</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">-</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">-</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{mcValueAdded.total.toLocaleString()}</td>
                <td className="py-1 px-1 text-right border border-charcoal-900">{mcValueAdded.total.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col justify-end">
          {paymentMethods && paymentMethods.length > 0 && (
            <div className="bg-white border border-charcoal-900 p-2 rounded-sm w-full">
              <p className="text-[8px] font-bold text-charcoal-900 uppercase tracking-widest mb-1.5 border-b border-charcoal-900 pb-1">Payment Split</p>
              <div className="space-y-1">
                {paymentMethods.map((pm, idx) => {
                  const amt = parseFloat(pm.amount) || 0;
                  if (amt <= 0) return null;
                  return (
                    <div key={idx} className="flex justify-between items-center text-[10px]">
                      <span className="text-charcoal-900 capitalize">{pm.type}</span>
                      <span className="font-mono font-bold text-charcoal-900">₹ {amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] items-center">
            <span className="font-bold text-charcoal-900 uppercase tracking-widest">Subtotal</span>
            <span className="font-mono font-bold text-charcoal-900 text-[11px]">₹ {(totals.itemsSubtotal + (mcValueAdded.total || 0)).toLocaleString()}</span>
          </div>

          {oldGold.total > 0 && (
            <div className="flex justify-between text-[9px] text-charcoal-900 bg-white py-1.5 px-2 rounded border border-charcoal-900">
              <span className="font-bold uppercase tracking-widest">Less: Old Gold</span>
              <span className="font-mono font-bold text-[11px]">- ₹ {oldGold.total.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-[10px] pt-1 items-center border-t border-charcoal-900">
            <span className="font-bold text-charcoal-900 uppercase tracking-widest">Taxable</span>
            <span className="font-mono font-bold text-charcoal-900 text-[11px]">₹ {totals.baseTaxable.toLocaleString()}</span>
          </div>

          {saleType === 'GST' && (
            <div className="space-y-0.5 text-[10px] bg-white p-1 rounded border border-charcoal-900 mt-1">
              <div className="flex justify-between text-charcoal-900">
                <span>CGST (1.5%)</span>
                <span className="font-mono font-bold">₹ {cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-900 border-t border-charcoal-900 pt-0.5">
                <span>SGST (1.5%)</span>
                <span className="font-mono font-bold">₹ {sgst.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-charcoal-900">
            <span className="font-serif font-bold text-lg uppercase">Total</span>
            <span className="font-serif font-bold text-xl text-charcoal-900">₹ {totals.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* FOOTER: TERMS & SIGNATURES */}
      <div className="border-t border-charcoal-900 pt-2">
        <p className="font-bold text-[8px] uppercase tracking-wider text-center mb-1">TERMS AND CONDITIONS</p>
        <div className="text-[7.5px] text-charcoal-900 leading-[1.35] text-justify space-y-1 border-t border-b border-charcoal-900 py-1.5 font-medium">
          <p>• Customers who wish to exchange / return the old jewellery, manufactured / sold under our trade mark / stamped seal along with the proof of purchase. As per our guarantee terms we do not consider the following: like stones, weeds, pearls, making charges, wastage & taxes if any.</p>
          <p>• The testing differs on different articles. ±2% tolerance is applicable on all articles and the same shall not be taken into consideration in any case.</p>
          <p>• This guarantee card is valid only if it is filled, stamped with seal and attested by authorised signatory.</p>
          <p>• Resale price is considered according to the market rate on the date of resale. (3% less for Exchange - 5% less for Sale)</p>
          <p>• Exchange within 2 Days of purchase.</p>
        </div>

        <p className="text-[8px] font-bold text-center italic mt-1 text-charcoal-900">I agree to the above terms and conditions</p>

        <div className="flex justify-between items-end mt-4">
          <div className="text-center w-36 border-t border-charcoal-900 pt-1">
            <p className="text-[8.5px] uppercase font-bold text-charcoal-900">Customer's Signature</p>
          </div>
          <div className="text-center w-40 border-t border-charcoal-900 pt-1">
            <p className="text-[9px] uppercase font-bold text-charcoal-900">For AZEEZ JEWELS</p>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-[8px] text-gray-400 uppercase tracking-[0.4em] font-medium">
        Azeez Jewels • Shivajinagar, Bangalore
      </div>
    </div>
  );
};
