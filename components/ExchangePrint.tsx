
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
    <div className={`${isScreenPreview ? 'block w-[148mm] mx-auto shadow-2xl p-4 my-8' : 'hidden print:block w-[148mm] h-[210mm] mx-auto p-4'} bg-white border-2 border-black box-border`}>
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
            height: 210mm;
          }
          
          .no-print {
            display: none !important;
          }
        }

        .purchase-a4 {
          width: 100%;
          height: 100%;
          background: #fff;
          padding: 2mm;
          box-sizing: border-box;
          position: relative;
        }

        .purchase-bill-box {
          background: #fff;
          border: 2px solid #000;
          width: 100%;
          height: 100%;
          padding: 4mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
            {/* TOP AREA */}
            <div className="purchase-top-header">
              <div>
                Mr./Mrs: <span className="purchase-pink-write uppercase">{customerName}</span>
              </div>
              <div className="text-right">
                No: <span className="purchase-pink-write">{voucherNo}</span>
              </div>
            </div>

            <div className="purchase-header-main">
              <div style={{ width: '90px', height: '90px', marginBottom: '2px', marginTop: '-10px' }}>
                <img src="/logo.png" alt="AZEEZ Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="purchase-title">AZEEZ JEWELS</h1>
              <div className="text-center">
                 <div style={{ fontSize: '10px', fontWeight: '900', color: '#A3803C', textTransform: 'uppercase', marginBottom: '1px' }}>Dealers in : 22 Ct. 916 KDM Gold Silver Ornaments</div>
                 <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1px' }}>#324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051</div>
                 <div style={{ fontSize: '9px', fontWeight: '800' }}>Prop: Azmathulla Khan — Mobile: 9916667573 | GSTIN: 29BBGPM2303C1Z4</div>
              </div>
              <div className="flex justify-between w-full mt-1 items-end">
                 <div style={{ fontSize: '12px', fontWeight: '900', border: '1px solid #000', padding: '1px 6px', textTransform: 'uppercase' }}>Exchange Voucher</div>
                 <div style={{ width: '30px', height: '30px' }}>
                    <img src="/BIS_PNG.png" alt="BIS Hallmark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 </div>
              </div>
            </div>

            <div className="purchase-sub-info">
              <div>Prop: Azmathulla Khan — Mobile: 9916667573</div>
              <div className="text-right font-mono uppercase">GSTIN: 29BBGPM2303C1Z4</div>
            </div>

            <div className="purchase-sub-info">
              <div style={{ fontSize: '12px' }}>Address: #324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051</div>
              <div className="text-right">
                Date: <span className="purchase-pink-write">{formatDate(date)}</span>
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
                  <td className="purchase-pink-write">{formatAmount(exchangeData.total)}</td>
                </tr>
              </tbody>
            </table>

            <div className="purchase-footer-row">
              <div className="text-gray-400 font-medium">CGST 1.5% —</div>
              <div className="text-gray-400 font-medium">SGST 1.5% —</div>
              <div>
                Total: <span className="purchase-pink-write" style={{ fontSize: '24px', borderBottom: '3px double #000' }}>
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
