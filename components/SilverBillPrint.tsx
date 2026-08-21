import React from 'react';
import { Customer, BillItem, PaymentRecord } from '../types';

interface SilverBillPrintProps {
  billNo: string;
  billDate: string;
  saleType: 'GST' | 'NON GST';
  customer: Customer | null;
  items: BillItem[];
  totals: {
    itemsSubtotal: number;
    baseTaxable: number;
    gstAmount: number;
    grandTotal: number;
  };
  mcValueAdded?: {
    total: number;
  };
  paymentMethods?: PaymentRecord[];
  exchangeValuePct?: string;
  returnValuePct?: string;
  isScreenPreview?: boolean;
}

export const SilverBillPrint: React.FC<SilverBillPrintProps> = ({
  billNo,
  billDate,
  saleType,
  customer,
  items,
  totals,
  mcValueAdded,
  paymentMethods,
  exchangeValuePct = '40%',
  returnValuePct = '50%',
  isScreenPreview = false,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day} - ${month} - 20${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const totalGst = saleType === 'GST' ? totals.gstAmount : 0;
  const halfGst = totalGst / 2;

  return (
    <div className={`silver-bill-container ${isScreenPreview ? 'preview-mode' : ''}`}>
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; font-family: 'Inter', sans-serif; }
          .no-print { display: none !important; }
          * { font-weight: bold !important; }
        }

        .silver-bill-container {
          width: 148mm;
          min-height: 210mm;
          padding: 8mm;
          box-sizing: border-box;
          background: #fff;
          color: #000;
          font-family: 'Inter', sans-serif;
          margin: 0 auto;
        }

        .preview-mode {
          border: 1px solid #ccc;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border-radius: 4px;
        }

        .silver-bill-outer {
          border: 2px solid #000;
          padding: 2px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .silver-bill-inner {
          border: 1px solid #000;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .silver-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          border-bottom: 1px solid #000;
          font-size: 10px;
          font-weight: 800;
        }

        .cash-bill-badge {
          border: 1px solid #000;
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .silver-brand-section {
          text-align: center;
          padding: 6px 4px;
          border-bottom: 1px solid #000;
          position: relative;
        }

        .ahs-badge-wrap {
          position: absolute;
          left: 12px;
          top: 6px;
          width: 38px;
          height: 38px;
        }

        .silver-title {
          font-family: 'Playfair Display', 'Times New Roman', serif;
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .silver-subtitle {
          font-size: 11px;
          font-weight: 800;
          margin-top: 2px;
        }

        .silver-address-line {
          font-size: 9px;
          font-weight: 700;
          margin-top: 2px;
        }

        .silver-cust-meta {
          display: grid;
          grid-template-columns: 1fr 140px;
          border-bottom: 1px solid #000;
        }

        .cust-details-box {
          padding: 6px 8px;
          border-right: 1px solid #000;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.6;
        }

        .bill-meta-box {
          padding: 6px 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 800;
        }

        .bill-no-red {
          color: #cc0000;
          font-family: monospace;
          font-size: 18px;
          font-weight: 900;
          margin-left: 6px;
        }

        .silver-table {
          width: 100%;
          border-collapse: collapse;
          flex-grow: 1;
        }

        .silver-table th {
          border-bottom: 1px solid #000;
          border-right: 1px solid #000;
          padding: 4px 6px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          text-align: center;
        }

        .silver-table th:last-child {
          border-right: none;
        }

        .silver-table td {
          border-right: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 4px 6px;
          font-size: 11px;
          font-weight: 700;
          vertical-align: top;
        }

        .silver-table td:last-child {
          border-right: none;
        }

        .silver-footer-grid {
          display: grid;
          grid-template-columns: 1fr 150px;
          border-bottom: 1px solid #000;
        }

        .footer-left-pct {
          padding: 6px;
          display: flex;
          gap: 6px;
          border-right: 1px solid #000;
          align-items: center;
        }

        .pct-box {
          border: 1px solid #000;
          border-radius: 4px;
          padding: 4px 8px;
          text-align: center;
          flex: 1;
        }

        .pct-label {
          font-size: 9px;
          font-weight: 800;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }

        .pct-val {
          font-size: 16px;
          font-weight: 900;
          font-family: serif;
        }

        .footer-right-totals {
          font-size: 10px;
          font-weight: 800;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 6px;
          border-bottom: 1px solid #000;
        }

        .totals-row:last-child {
          border-bottom: none;
        }

        .total-final {
          font-size: 13px;
          font-weight: 900;
          background: #f9f9f9;
        }

        .silver-disclaimer {
          padding: 6px 8px;
          font-size: 8px;
          font-weight: 700;
          line-height: 1.3;
          border-bottom: 1px solid #000;
        }

        .silver-signatures {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 10px 12px 6px 12px;
          font-size: 10px;
          font-weight: 800;
        }
      `}</style>

      <div className="silver-bill-outer">
        <div className="silver-bill-inner">
          {/* HEADER TOP BAR */}
          <div className="silver-header-top">
            <div>GSTIN : 29BPSPK1616Q1Z2</div>
            <div className="cash-bill-badge">CASH BILL</div>
            <div className="flex items-center gap-1">
              <span>📞 9916667573</span>
            </div>
          </div>

          {/* BRAND HEAD */}
          <div className="silver-brand-section">
            <div className="ahs-badge-wrap">
              <img src="/logo without bg.png" alt="AHS Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="silver-title">Azeez Jewels</h1>
            <div className="silver-subtitle">Gold and Silver Ornaments</div>
            <div className="silver-address-line">
              No. 324, Jumma Masjid Road (O.P.H. Road) Shivaji Nagar, Bangalore - 51
            </div>
            <div className="silver-address-line" style={{ fontSize: '8.5px', marginTop: '1px' }}>
              Email : azmathkhan7676@gmail.com
            </div>
          </div>

          {/* CUSTOMER & BILL META */}
          <div className="silver-cust-meta">
            <div className="cust-details-box">
              <div>Name: <span className="uppercase font-bold">{customer?.name || 'Walk-in Customer'}</span></div>
              <div style={{ marginTop: '3px' }}>Address: <span>{customer?.address || customer?.phone || 'Shivajinagar, Bangalore'}</span></div>
            </div>
            <div className="bill-meta-box">
              <div>
                No. <span className="bill-no-red">{billNo.replace('MJ-', '')}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                Date : <span>{formatDate(billDate)}</span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="silver-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Sl. No.</th>
                <th style={{ width: '56%', textAlign: 'left' }}>DESCRIPTION</th>
                <th style={{ width: '16%' }}>Weight</th>
                <th style={{ width: '20%' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const wt = item.net_weight || item.weight || item.gross_weight || 0;
                return (
                  <tr key={item.id || idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td className="uppercase">
                      {item.item_name}
                      {item.purity && <span className="text-[9px] text-gray-600 block font-mono">Purity: {item.purity}</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{wt.toFixed(3)}g</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹ {item.line_total.toLocaleString()}</td>
                  </tr>
                );
              })}

              {mcValueAdded && mcValueAdded.total > 0 && (
                <tr>
                  <td style={{ textAlign: 'center' }}>{items.length + 1}</td>
                  <td className="uppercase">Value Added / Making Charges</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹ {mcValueAdded.total.toLocaleString()}</td>
                </tr>
              )}

              {/* Fill blank rows for physical receipt paper aesthetic */}
              {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                <tr key={`blank-${i}`} style={{ height: '24px' }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FOOTER GRID */}
          <div className="silver-footer-grid">
            <div className="footer-left-pct">
              <div className="pct-box">
                <div className="pct-label">Exchange Value</div>
                <div className="pct-val">{exchangeValuePct}</div>
              </div>
              <div className="pct-box">
                <div className="pct-label">Return Value</div>
                <div className="pct-val">{returnValuePct}</div>
              </div>
            </div>

            <div className="footer-right-totals">
              {saleType === 'GST' ? (
                <>
                  <div className="totals-row">
                    <span>SGST @ 1.5%</span>
                    <span className="font-mono">₹ {halfGst.toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span>CGST @ 1.5%</span>
                    <span className="font-mono">₹ {halfGst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span className="font-mono">₹ {totals.itemsSubtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="totals-row total-final">
                <span>TOTAL</span>
                <span className="font-mono">₹ {totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="silver-disclaimer">
            If the above goods are returned even immediately after purchase the amount will be refunded at the market value i.e. after deducting the making charges, wastage and Taxes
          </div>

          {/* SIGNATURES */}
          <div className="silver-signatures">
            <div>Party's Signature</div>
            <div>For <span className="font-serif font-bold text-sm">Azeez Jewels</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
