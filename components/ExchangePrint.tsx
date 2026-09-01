
import React from 'react';
import { Customer } from '../types';

interface ExchangePrintProps {
  voucherNo: string;
  date: string;
  customer: Customer | null;
  exchangeData: {
    particulars: string;
    weight: number;
    purity: number | string;
    rate: number;
    total: number;
    hsn_code: string;
    gst_rate?: number;
    gst_amount?: number;
  };
  isScreenPreview?: boolean;
}

export const ExchangePrint: React.FC<ExchangePrintProps> = ({
  voucherNo,
  date,
  customer,
  exchangeData,
  isScreenPreview = false
}) => {
  // Format date from ISO string to DD/MM/YY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB').replace(/-/g, '/');
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Format weight to show 3 decimal places
  const formatWeight = (weight: number) => {
    return weight.toFixed(3);
  };

  // Format rate (no decimals if whole number, otherwise 2 decimals, with commas)
  const formatRate = (rate: number) => {
    if (rate % 1 === 0) {
      return rate.toLocaleString('en-IN');
    }
    return rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format amount (with commas, 2 decimals)
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const customerName = customer?.name || 'N/A';
  const finalHsnCode = exchangeData.hsn_code || '7113';

  return (
    <div className={`${isScreenPreview ? 'block w-[148mm] mx-auto shadow-2xl p-2 my-4' : 'hidden print:block w-[148mm] h-[210mm] mx-auto p-1'} bg-white box-border`}>
      <style>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .purchase-bill-print-wrapper {
            display: block !important;
            width: 148mm;
            height: 208mm;
            max-height: 208mm;
            padding: 2mm;
            box-sizing: border-box;
            overflow: hidden;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          .no-print {
            display: none !important;
          }
        }

        .purchase-a4 {
          width: 100%;
          height: 100%;
          background: #fff;
          padding: 0;
          box-sizing: border-box;
          position: relative;
        }

        .purchase-bill-box {
          background: #fff;
          border: 2px solid #000;
          width: 100%;
          height: 100%;
          padding: 3mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .purchase-top-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 1mm;
        }

        .purchase-header-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          margin-bottom: 2mm;
          border-bottom: 2px solid #000;
          padding-bottom: 1mm;
        }

        .purchase-title {
          font-size: 24px;
          font-weight: 900;
          color: #000;
          letter-spacing: -1px;
          font-family: 'serif';
          margin: 0;
          text-align: center;
          width: 100%;
        }

        .purchase-sub-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5mm;
          font-size: 10px;
          font-weight: 600;
        }

        .purchase-table {
          width: 100%;
          margin-top: 3mm;
          border-collapse: collapse;
          font-size: 12px;
          font-weight: bold;
        }

        .purchase-table th,
        .purchase-table td {
          border: 1px solid #000;
          padding: 6px 8px;
          text-align: center;
        }

        .purchase-table th {
          background: #f8fafc;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        .purchase-big-col {
          height: 30mm;
          vertical-align: middle;
          text-align: left;
          padding-left: 10px;
        }

        .purchase-pink-write {
          font-size: 14px;
          font-weight: 800;
          color: #000;
        }

        .purchase-footer-row {
          margin-top: auto;
          padding-bottom: 3mm;
          display: flex;
          justify-content: flex-end;
          gap: 30px;
          font-size: 14px;
          font-weight: bold;
        }

        .purchase-signature {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
          margin-top: 3mm;
          padding-right: 5mm;
        }

        .purchase-highlight {
          color: #B8860B;
        }
      `}</style>

      <div className={`purchase-bill-print-wrapper ${isScreenPreview ? 'preview-mode' : ''}`}>
        <div className="purchase-a4">
          <div className="purchase-bill-box">
            {/* BRAND WATERMARK LOGO */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.035] select-none">
              <div className="text-center">
                <div className="text-[130px] font-serif font-bold text-charcoal-900 leading-none tracking-tighter">AHS</div>
                <div className="text-2xl font-serif font-bold uppercase tracking-[0.3em] text-charcoal-900 mt-2">AZEEZ JEWELS</div>
              </div>
            </div>
            {/* HEADER TOP BAR */}
            <div className="flex justify-between items-center px-2 py-1 border-b border-charcoal-900 text-[10px] font-extrabold">
              <div>GSTIN : 29BPSPK1616Q1Z2</div>
              <div className="border border-charcoal-900 px-2 py-[1px] text-[11px] font-black">VOUCHER</div>
              <div className="flex items-center gap-1">
                <span>📞 9916667573</span>
              </div>
            </div>

            {/* BRAND SECTION (MATCHING GOLD BILL) */}
            <div className="text-center py-2 relative flex flex-col items-center justify-center border-b-2 border-charcoal-900">
              <div className="absolute left-2 top-0 bottom-0 w-24 h-full flex items-center justify-center">
                <img src="/logowithoutbg.png" alt="AHS Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-serif text-3xl font-black text-charcoal-900 uppercase tracking-tighter m-0 leading-tight">
                Azeez Jewels
              </h1>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-charcoal-800 border-y border-charcoal-800 py-[2px] mt-1 inline-block px-4 mb-1">
                Gold and Silver Ornaments
              </div>
              <div className="text-[9px] font-extrabold leading-tight text-charcoal-900 mt-1 max-w-[70%]">
                No. 324, Jumma Masjid Road (O.P.H. Road) Shivaji Nagar, Bangalore - 51
              </div>
              <div className="text-[8.5px] font-extrabold leading-tight text-charcoal-900 mt-[1px]">
                Email : azmathkhan7676@gmail.com
              </div>
            </div>

            {/* VOUCHER & CUSTOMER INFO BAR */}
            <div className="grid grid-cols-2 gap-2 my-2 border border-charcoal-900 p-1.5 rounded-sm">
              <div>
                <h3 className="text-[8px] font-bold text-charcoal-900 uppercase tracking-widest mb-0.5">Customer Details</h3>
                <div className="text-xs">
                  <p className="font-bold text-charcoal-900 uppercase">{customerName || 'Walk-in Customer'}</p>
                  <p className="font-mono text-[10px] text-charcoal-700">{customer?.phone}</p>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center">
                <p className="font-mono text-xs font-bold text-charcoal-900">NO: {voucherNo}</p>
                <p className="font-mono text-[10px] text-charcoal-700">DATE: {formatDate(date)}</p>
              </div>
            </div>

            {/* TABLE LAYOUT */}
            <table className="purchase-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Particulars of Exchange</th>
                  <th style={{ width: '12%' }}>HSN</th>
                  <th style={{ width: '12%' }}>Weight (g)</th>
                  <th style={{ width: '12%' }}>Purity</th>
                  <th style={{ width: '12%' }}>Rate</th>
                  <th style={{ width: '12%' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="purchase-big-col">
                    <span className="purchase-pink-write uppercase">{exchangeData.particulars || 'OLD GOLD ORNAMENTS'}</span>
                  </td>
                  <td className="purchase-pink-write">{finalHsnCode}</td>
                  <td className="purchase-pink-write">
                    {formatWeight(exchangeData.weight)}
                  </td>
                  <td className="purchase-pink-write">{exchangeData.purity || '-'}</td>
                  <td className="purchase-pink-write">
                    {formatRate(exchangeData.rate)}
                  </td>
                  <td className="purchase-pink-write">{formatAmount(exchangeData.total - (exchangeData.gst_amount || 0))}</td>
                </tr>
              </tbody>
            </table>

            <div className="purchase-footer-row flex-col items-end gap-1 mt-2">
              {exchangeData.gst_amount && exchangeData.gst_amount > 0 ? (
                <>
                  <div className="text-gray-600 font-medium text-[11px] flex justify-between w-48">
                    <span>CGST {(exchangeData.gst_rate || 0) / 2}%</span>
                    <span>₹ {formatAmount(exchangeData.gst_amount / 2)}</span>
                  </div>
                  <div className="text-gray-600 font-medium text-[11px] flex justify-between w-48 border-b border-gray-400 pb-1">
                    <span>SGST {(exchangeData.gst_rate || 0) / 2}%</span>
                    <span>₹ {formatAmount(exchangeData.gst_amount / 2)}</span>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between w-48 pt-1">
                <span>Total:</span>
                <span className="purchase-pink-write" style={{ fontSize: '20px', borderBottom: '3px double #000' }}>
                  ₹ {formatAmount(exchangeData.total)}
                </span>
              </div>
            </div>

            <div className="purchase-signature">
              <div className="text-[10px] uppercase text-gray-400 mb-8">Authorized Signatory</div>
              For AZEEZ JEWELS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
