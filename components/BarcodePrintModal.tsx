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

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [tagSize, setTagSize] = useState<TagSize>('100x15');
  const [printQuantity, setPrintQuantity] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showHUID, setShowHUID] = useState<boolean>(true);
  const [tailPosition, setTailPosition] = useState<'right' | 'left'>('right');

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelDims = {
      '50x12': { width: 50, height: 12, printable: 32 },
      '81x12': { width: 81, height: 12, printable: 52 },
      '100x15': { width: 100, height: 15, printable: 70 },
      '100x20': { width: 100, height: 20, printable: 72 },
    }[tagSize]!;

    const barcodeText = item.barcode || 'AHS000000';
    const flexDir = tailPosition === 'left' ? 'row-reverse' : 'row';
    const W = labelDims.width;
    const H = labelDims.height;
    const PW = labelDims.printable;

    // Font sizes in mm — proportional to label height
    const brandFs = (H * 0.12).toFixed(2);
    const purityFs = (H * 0.10).toFixed(2);
    const barcodeH = (H * 0.22).toFixed(2);
    const skuFs = (H * 0.09).toFixed(2);
    const nameFs = (H * 0.09).toFixed(2);
    const weightFs = (H * 0.09).toFixed(2);
    const huidFs = (H * 0.08).toFixed(2);
    const priceFs = (H * 0.09).toFixed(2);

    const labelHtml = Array.from({ length: printQuantity }).map((_, idx) => `
      <div class="lc">
        <div class="lp">
          <div class="hdr">
            <span class="br">AZEEZ JEWELS</span>
            <span class="pu">${item.purity || '22K 916'}</span>
          </div>
          <div class="bc">
            <svg id="barcode-${idx}"></svg>
          </div>
          <div class="sk">${item.barcode}</div>
          <div class="nm">${item.item_name}</div>
          <div class="wt">
            <span>Gr:${(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
            <span>Nt:${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
          </div>
          ${showHUID && item.huid ? `<div class="hu">HUID:${item.huid}</div>` : ''}
          ${showPrice && item.net_price ? `<div class="pr">₹${item.net_price.toLocaleString()}</div>` : ''}
        </div>
        <div class="tl"></div>
      </div>
    `).join('');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head><title>Label</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
@page{size:${W}mm ${H}mm;margin:0!important}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}mm;height:${H}mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:hidden}
.lc{width:${W}mm;height:${H}mm;display:flex;flex-direction:${flexDir};align-items:stretch;page-break-after:always;page-break-inside:avoid;padding:0.2mm 0.4mm;overflow:hidden}
.lp{width:${PW}mm;height:${H - 0.4}mm;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
.tl{flex:1}
.hdr{display:flex;justify-content:space-between;align-items:center;height:${brandFs}mm;line-height:1}
.br{font-size:${brandFs}mm;font-weight:900;letter-spacing:0.1mm}
.pu{font-size:${purityFs}mm;font-weight:700}
.bc{width:100%;height:${barcodeH}mm;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bc svg{width:100%;height:${barcodeH}mm}
.sk{font-family:monospace;font-size:${skuFs}mm;font-weight:900;text-align:center;line-height:1;letter-spacing:0.1mm}
.nm{font-size:${nameFs}mm;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1}
.wt{display:flex;justify-content:space-between;font-size:${weightFs}mm;font-weight:700;font-family:monospace;line-height:1}
.hu{font-size:${huidFs}mm;font-weight:700;line-height:1}
.pr{font-size:${priceFs}mm;font-weight:900;text-align:right;line-height:1}
@media print{html,body{width:${W}mm!important;height:${H}mm!important}.lc{width:${W}mm!important;height:${H}mm!important}}
</style>
</head>
<body>
${labelHtml}
<script>
window.onload = function() {
  for (var i = 0; i < ${printQuantity}; i++) {
    try {
      JsBarcode("#barcode-" + i, "${barcodeText}", {
        format: "CODE128",
        width: 1,
        height: 30,
        displayValue: false,
        margin: 0,
        background: "transparent"
      });
    } catch(e) { console.error(e); }
  }
};
<\/script>
</body>
</html>`);
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
