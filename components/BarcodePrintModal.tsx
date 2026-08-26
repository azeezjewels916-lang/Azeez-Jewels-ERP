import React, { useState } from 'react';
import { X, Printer, Tag, Check, Sliders } from 'lucide-react';
import { Button } from './UIComponents';
import { Item } from '../types';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

export type TagSize = '81x12' | '100x15' | '100x20';

// Simple Pure SVG Code 128 Barcode Generator
const Code128Barcode: React.FC<{ code: string; height?: number }> = ({ code, height = 30 }) => {
  const cleanCode = code || '00000000';

  // Simple pseudo barcode pattern generator for visual presentation
  const bars: { x: number; width: number }[] = [];
  let currentX = 0;

  // Start pattern
  bars.push({ x: currentX, width: 2 }); currentX += 4;
  bars.push({ x: currentX, width: 1 }); currentX += 2;

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 2) % 3) + 1;
    const w3 = ((charCode * 3) % 3) + 1;

    bars.push({ x: currentX, width: w1 }); currentX += w1 + 1;
    bars.push({ x: currentX, width: w2 }); currentX += w2 + 1;
    bars.push({ x: currentX, width: w3 }); currentX += w3 + 1;
  }

  // Stop pattern
  bars.push({ x: currentX, width: 2 }); currentX += 3;
  bars.push({ x: currentX, width: 3 }); currentX += 5;

  return (
    <svg viewBox={`0 0 ${currentX} ${height}`} className="w-full h-auto max-h-8">
      {bars.map((bar, idx) => (
        <rect key={idx} x={bar.x} y="0" width={bar.width} height={height} fill="#000000" />
      ))}
    </svg>
  );
};

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [tagSize, setTagSize] = useState<TagSize>('81x12');
  const [printQuantity, setPrintQuantity] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showHUID, setShowHUID] = useState<boolean>(true);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelDims = {
      '81x12': { width: '81mm', height: '12mm', printable: '52mm' },
      '100x15': { width: '100mm', height: '15mm', printable: '68mm' },
      '100x20': { width: '100mm', height: '20mm', printable: '72mm' },
    }[tagSize];

    const cleanCode = (item.barcode || 'AHS000000').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    let barRects = '';
    let curX = 2;
    for (let i = 0; i < cleanCode.length; i++) {
      const c = cleanCode.charCodeAt(i);
      const w1 = (c % 3) + 1;
      const w2 = ((c * 2) % 3) + 1;
      barRects += `<rect x="${curX}" y="0" width="${w1}" height="28" fill="#000" />`;
      curX += w1 + 1;
      barRects += `<rect x="${curX}" y="0" width="${w2}" height="28" fill="#000" />`;
      curX += w2 + 1;
    }

    const labelHtml = Array.from({ length: printQuantity }).map(() => `
      <div className="label-container">
        <div className="label-printable">
          <div className="label-header">
            <span className="brand">AZEEZ JEWELS</span>
            <span className="purity">${item.purity || '22K 916'}</span>
          </div>
          <div className="barcode-wrap">
            <svg viewBox="0 0 ${Math.max(curX + 5, 100)} 28" style="width: 100%; height: 18px;" preserveAspectRatio="none">
              <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
              ${barRects}
            </svg>
          </div>
          <div className="sku-code">${item.barcode}</div>
          <div className="item-name">${item.item_name}</div>
          <div className="weights-row">
            <span>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
            <span>Net: ${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
          </div>
          ${showHUID && item.huid ? `<div className="huid-code">HUID: ${item.huid}</div>` : ''}
          ${showPrice && item.net_price ? `<div className="price-tag">₹ ${item.net_price.toLocaleString()}</div>` : ''}
        </div>
        <div className="label-tail"></div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TSC TTP-244 Pro Barcode Printing - ${item.barcode}</title>
          <style>
            @page {
              size: ${labelDims.width} ${labelDims.height};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              background: #fff;
              color: #000;
              -webkit-print-color-adjust: exact;
            }
            .label-container {
              width: ${labelDims.width};
              height: ${labelDims.height};
              box-sizing: border-box;
              display: flex;
              page-break-after: always;
              overflow: hidden;
              padding: 1mm;
            }
            .label-printable {
              width: ${labelDims.printable};
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-right: 1mm;
            }
            .label-tail {
              flex: 1;
              background: transparent;
            }
            .label-header {
              display: flex;
              justify-content: space-between;
              font-size: 7px;
              font-weight: bold;
              line-height: 1;
            }
            .brand { font-size: 7px; font-weight: 900; }
            .purity { font-size: 6.5px; font-weight: bold; }
            .sku-code {
              font-family: monospace;
              font-size: 6.5px;
              font-weight: bold;
              text-align: center;
              line-height: 1;
            }
            .item-name {
              font-size: 6.5px;
              font-weight: bold;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1;
            }
            .weights-row {
              display: flex;
              justify-content: space-between;
              font-size: 6px;
              font-weight: bold;
              font-family: monospace;
              line-height: 1;
            }
            .huid-code {
              font-size: 5.5px;
              font-weight: bold;
              line-height: 1;
            }
            .price-tag {
              font-size: 6.5px;
              font-weight: 900;
              text-align: right;
              line-height: 1;
            }
          </style>
        </head>
        <body>
          ${labelHtml}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-app-border w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        {/* MODAL HEADER */}
        <div className="bg-charcoal-900 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center font-bold">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base uppercase tracking-wide">Jewellery Barcode Tag Generator</h3>
              <p className="text-[10px] text-gold-500 uppercase tracking-widest font-bold">TSC TTP-244 Pro Thermal Printer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6">
          {/* TAG SIZE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
              Select Tag / Label Size (TSC TTP-244 Pro)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '81x12', label: '81mm × 12mm', desc: 'Dumbbell Tag (Rings/Earrings)' },
                { id: '100x15', label: '100mm × 15mm', desc: 'Chain / Necklace Tag' },
                { id: '100x20', label: '100mm × 20mm', desc: 'Heavy Tag (Hallmark / HUID)' },
              ].map(size => (
                <button
                  key={size.id}
                  onClick={() => setTagSize(size.id as TagSize)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${tagSize === size.id
                    ? 'border-gold-500 bg-gold-50/70 shadow-sm ring-1 ring-gold-500'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-charcoal-900">{size.label}</span>
                    {tagSize === size.id && <Check size={14} className="text-gold-600" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">{size.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ON-SCREEN TAG PREVIEW BOX */}
          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Live Label Preview</span>
            <div className="bg-white border-2 border-dashed border-gray-400 p-2.5 rounded shadow-sm w-72 h-20 flex justify-between items-center font-sans relative">
              <div className="flex-1 flex flex-col justify-between h-full pr-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[9px] text-charcoal-900">AZEEZ JEWELS</span>
                  <span className="font-bold text-[8px] text-gold-600">{item.purity || '22K 916'}</span>
                </div>

                <Code128Barcode code={item.barcode} height={16} />

                <div className="font-mono text-[8px] font-bold text-center tracking-tighter">{item.barcode}</div>
                <div className="text-[8px] font-bold truncate">{item.item_name}</div>

                <div className="flex justify-between text-[7.5px] font-mono font-bold text-gray-600">
                  <span>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
                  <span>Net: ${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
                </div>
              </div>
              <div className="w-16 h-full border-l border-dashed border-gray-300 flex items-center justify-center text-[7px] font-bold text-gray-400 uppercase rotate-90">
                Non-Sticky Tail
              </div>
            </div>
          </div>

          {/* PRINT OPTIONS & QUANTITY */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Copies</label>
              <input
                type="number"
                min={1}
                max={50}
                value={printQuantity}
                onChange={(e) => setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-mono font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="showHuidOpt"
                checked={showHUID}
                onChange={(e) => setShowHUID(e.target.checked)}
                className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
              />
              <label htmlFor="showHuidOpt" className="text-xs font-bold text-charcoal-800 cursor-pointer">Include HUID</label>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="showPriceOpt"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
              />
              <label htmlFor="showPriceOpt" className="text-xs font-bold text-charcoal-800 cursor-pointer">Include Selling Price</label>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <Button onClick={handlePrint} className="shadow-lg">
            <Printer size={16} className="mr-2" /> Print Tag on TSC TTP-244 Pro
          </Button>
        </div>
      </div>
    </div>
  );
};
