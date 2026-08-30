import React, { useState } from 'react';
import { X, Printer, Tag, Check, Sliders } from 'lucide-react';
import { Button } from './UIComponents';
import { Item } from '../types';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

export type TagSize = '50x12' | '81x12' | '100x15' | '100x20';

// ============================================================
// REAL Code 128B Barcode Encoder
// Each value maps to 6 widths: [bar, space, bar, space, bar, space]
// Each character symbol = 11 modules wide
// ============================================================
const CODE128B_PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],// 10-14
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],// 20-24
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],// 30-34
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],// 40-44
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],// 50-54
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],// 60-64
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],// 70-74
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],// 80-84
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],// 90-94
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],// 100-104
  [2,1,1,2,3,2],[2,3,3,1,1,1,2]  // 105 = START B, 106 = STOP (7 elements)
];
// START_B = 104, STOP = 106

/** Encode a string to Code 128B bar/space modules */
function encodeCode128B(text: string): number[] {
  const values: number[] = [];
  // Start Code B = value 104
  values.push(104);
  for (let i = 0; i < text.length; i++) {
    const v = text.charCodeAt(i) - 32; // Code 128B: value = ASCII - 32
    values.push(v < 0 || v > 94 ? 0 : v);
  }
  // Calculate checksum (mod 103)
  let checksum = values[0]; // start with START_B value
  for (let i = 1; i < values.length; i++) {
    checksum += values[i] * i;
  }
  checksum = checksum % 103;
  values.push(checksum);
  values.push(106); // STOP

  // Convert values to module widths
  const modules: number[] = [];
  for (const v of values) {
    const pattern = CODE128B_PATTERNS[v];
    if (pattern) modules.push(...pattern);
  }
  return modules;
}

/** Generate SVG bar rects string from Code 128B modules for print HTML */
function generateBarcodeSVGRects(text: string, barHeight: number): { rects: string; totalWidth: number } {
  const modules = encodeCode128B(text);
  let rects = '';
  let x = 0;
  let isBar = true; // starts with bar
  for (const width of modules) {
    if (isBar) {
      rects += `<rect x="${x}" y="0" width="${width}" height="${barHeight}" fill="#000" shape-rendering="crispEdges" />`;
    }
    x += width;
    isBar = !isBar;
  }
  return { rects, totalWidth: x };
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [tagSize, setTagSize] = useState<TagSize>('81x12');
  const [printQuantity, setPrintQuantity] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showHUID, setShowHUID] = useState<boolean>(true);
  const [tailPosition, setTailPosition] = useState<'right' | 'left'>('right');

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelDims = {
      '50x12': { width: '50mm', height: '12mm', printable: '32mm' },
      '81x12': { width: '81mm', height: '12mm', printable: '52mm' },
      '100x15': { width: '100mm', height: '15mm', printable: '68mm' },
      '100x20': { width: '100mm', height: '20mm', printable: '72mm' },
    }[tagSize];

    const barcodeText = item.barcode || 'AHS000000';
    const { rects: barRects, totalWidth: barTotalWidth } = generateBarcodeSVGRects(barcodeText, 28);

    const flexDir = tailPosition === 'left' ? 'row-reverse' : 'row';

    const labelHtml = Array.from({ length: printQuantity }).map(() => `
      <div class="label-container">
        <div class="label-printable">
          <div class="label-header">
            <span class="brand">AZEEZ JEWELS</span>
            <span class="purity">${item.purity || '22K 916'}</span>
          </div>
          <div class="barcode-wrap">
            <svg viewBox="0 0 ${barTotalWidth} 28" style="width: 100%; height: 14px;" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">
              ${barRects}
            </svg>
          </div>
          <div class="sku-code">${item.barcode}</div>
          <div class="item-name">${item.item_name}</div>
          <div class="weights-row">
            <span>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
            <span>Net: ${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
          </div>
          ${showHUID && item.huid ? `<div class="huid-code">HUID: ${item.huid}</div>` : ''}
          ${showPrice && item.net_price ? `<div class="price-tag">₹ ${item.net_price.toLocaleString()}</div>` : ''}
        </div>
        <div class="label-tail"></div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <style>
            @page {
              size: ${labelDims.width} ${labelDims.height};
              margin: 0mm !important;
            }
            html, body {
              width: ${labelDims.width};
              height: ${labelDims.height};
              margin: 0 !important;
              padding: 0 !important;
              background: #fff;
              color: #000;
              font-family: 'Arial', sans-serif;
              -webkit-print-color-adjust: exact;
              overflow: hidden;
            }
            .label-container {
              width: ${labelDims.width};
              height: ${labelDims.height};
              box-sizing: border-box;
              display: flex;
              flex-direction: ${flexDir};
              align-items: center;
              page-break-after: always;
              page-break-inside: avoid;
              padding: 0.5mm 1mm;
              overflow: hidden;
            }
            .label-printable {
              width: ${labelDims.printable};
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-right: 1mm;
              box-sizing: border-box;
            }
            .label-tail {
              flex: 1;
              background: transparent;
            }
            .label-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 7px;
              font-weight: bold;
              line-height: 1;
            }
            .brand { font-size: 7.5px; font-weight: 900; letter-spacing: 0.2px; }
            .purity { font-size: 7px; font-weight: bold; }
            .barcode-wrap {
              width: 100%;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0.5mm 0;
            }
            .sku-code {
              font-family: monospace;
              font-size: 7px;
              font-weight: 900;
              text-align: center;
              line-height: 1;
              letter-spacing: 0.5px;
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
              font-size: 6.5px;
              font-weight: bold;
              font-family: monospace;
              line-height: 1;
            }
            .huid-code {
              font-size: 6px;
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
            }, 350);
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
        <div className="p-6 space-y-5">
          {/* TAG SIZE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
              1. Select Physical Tag / Label Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '50x12', label: '50mm × 12mm', desc: 'Standard Dumbbell' },
                { id: '81x12', label: '81mm × 12mm', desc: 'Extended Dumbbell' },
                { id: '100x15', label: '100mm × 15mm', desc: 'Chain / Necklace' },
                { id: '100x20', label: '100mm × 20mm', desc: 'Heavy Tag (HUID)' },
              ].map(size => (
                <button
                  key={size.id}
                  onClick={() => setTagSize(size.id as TagSize)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${tagSize === size.id
                    ? 'border-gold-500 bg-gold-50/70 shadow-sm ring-1 ring-gold-500'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-charcoal-900">{size.label}</span>
                    {tagSize === size.id && <Check size={13} className="text-gold-600" />}
                  </div>
                  <p className="text-[9.5px] text-gray-500 mt-0.5 leading-tight">{size.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STICKER TAIL DIRECTION */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
              2. Sticker Tail Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'right', label: 'Tail Right (Standard Head Left)' },
                { id: 'left', label: 'Tail Left (Reversed Head Right)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTailPosition(opt.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${tailPosition === opt.id
                    ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* CRITICAL PRINTER SETTINGS BANNER */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wider text-[11px]">
              <Sliders size={14} className="text-amber-600" /> Key Chrome Settings & Printer Calibration (TSC TTP-244 Pro)
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium text-amber-800">
              <li>In Chrome Print: Set <strong>Margins</strong> to <strong>None</strong> & Uncheck <strong>Headers & Footers</strong></li>
              <li><strong>TSC Driver Setup</strong>: In Windows <i>Devices & Printers → TSC TTP-244 Pro → Preferences</i>, set <strong>Media Type: Labels with Gaps</strong> (Gap: 2mm)</li>
              <li><strong>Calibrate Gap Sensor</strong>: Turn OFF printer, hold <strong>FEED button</strong>, turn ON until green LED blinks — this aligns physical sticker gaps perfectly!</li>
            </ul>
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
