import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Tag, Check, Sliders, ScanLine, Eye } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Button } from './UIComponents';
import { InventoryItem } from '../types';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export type TagSize = '50x12' | '81x12' | '100x15' | '100x20';

/**
 * Generate a high-contrast vector SVG barcode for thermal printing.
 * Uses 2-dot thick modules (10 mil = 0.25mm) - identical to vendor jewellery tags (e.g. TV/5554).
 * Vector <rect> elements are sent directly to Windows GDI as solid black rectangles,
 * completely avoiding bitmap resampling, blurriness, and dithering.
 */
function getBarcodeSvgString(rawText: string): { svgHtml: string; encodedValue: string } {
  try {
    const fullText = (rawText || 'AHS000000').trim();

    // If text has digits (e.g. AHS464454 -> 464454), encode the numeric digits with 2-dot thick bars
    // In Code 128 (Code C), numeric pairs use only 11 modules per 2 digits = ultra-compact & thick bars!
    const digitsOnly = fullText.replace(/\D/g, '');
    const useNumericCode = digitsOnly.length >= 4;
    const valueToEncode = useNumericCode ? digitsOnly : fullText;

    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svgNode, valueToEncode, {
      format: "CODE128",
      width: 2,         // EXACT 2 physical printer dots per module (0.25mm = 10 mil)
      height: 52,       // Generous vertical bar height for easy laser/CCD scanner capture
      displayValue: false,
      margin: 12,       // Pure white quiet zones on both left and right
      background: "#ffffff",
      lineColor: "#000000"
    });

    svgNode.setAttribute("style", "width: auto; height: 100%; max-width: 23mm; max-height: 8mm; display: block; margin: 0 auto;");
    svgNode.setAttribute("shape-rendering", "crispEdges");

    return { svgHtml: svgNode.outerHTML, encodedValue: valueToEncode };
  } catch (e) {
    console.error("Barcode SVG generation error:", e);
    return {
      svgHtml: `<svg viewBox="0 0 100 35"><rect width="100%" height="100%" fill="#fff"/></svg>`,
      encodedValue: rawText
    };
  }
}

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
  const [scannedTestResult, setScannedTestResult] = useState<string>('');
  const previewSvgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrintQuantity(1);
      setScannedTestResult('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && item && previewSvgRef.current) {
      const barcodeText = (item.barcode || 'AHS000000').trim();
      const { svgHtml } = getBarcodeSvgString(barcodeText);
      previewSvgRef.current.innerHTML = svgHtml;
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const barcodeText = (item.barcode || 'AHS000000').trim();
  const { svgHtml: barcodeSvgHtml, encodedValue } = getBarcodeSvgString(barcodeText);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print barcodes.");
      return;
    }

    const labelDims = {
      '50x12': { width: 50, height: 12, halfW: 16, tailW: 18 },
      '81x12': { width: 81, height: 12, halfW: 26, tailW: 29 },
      '100x15': { width: 100, height: 15, halfW: 27.5, tailW: 45 },
      '100x20': { width: 100, height: 20, halfW: 36, tailW: 28 },
    }[tagSize]!;

    const flexDir = tailPosition === 'left' ? 'row-reverse' : 'row';
    const W = labelDims.width;
    const H = labelDims.height;
    const HW = labelDims.halfW;
    const TW = labelDims.tailW;

    const labelHtml = Array.from({ length: printQuantity }).map(() => `
      <div class="lc">
        <!-- LEFT HALF (Side 1: Details) -->
        <div class="half left-half">
          <div class="purity">${item.purity || '22K 916'}</div>
          <div class="item-name">${item.item_name}</div>
          <div class="weights">
            <div>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</div>
            <div>Nt: ${(item.net_weight || item.weight || 0).toFixed(3)}g</div>
          </div>
          ${showHUID && item.huid ? `<div class="huid">HUID: ${item.huid}</div>` : ''}
          ${showPrice && item.net_price ? `<div class="price">₹ ${item.net_price.toLocaleString()}</div>` : ''}
        </div>

        <!-- RIGHT HALF (Side 2: Brand, Barcode, SKU) -->
        <div class="half right-half">
          <div class="brand">AZEEZ JEWELS</div>
          <div class="bc-box">
            ${barcodeSvgHtml}
          </div>
          <div class="sku">${barcodeText}</div>
        </div>

        <!-- TAIL -->
        <div class="tail"></div>
      </div>
    `).join('');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Tag - ${barcodeText}</title>
<style>
@page {
  size: ${W}mm ${H}mm;
  margin: 0mm !important;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: ${W}mm;
  height: ${H}mm;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden;
}
.lc {
  width: ${W}mm;
  height: ${H}mm;
  display: flex;
  flex-direction: ${flexDir};
  align-items: center;
  justify-content: space-between;
  page-break-after: always;
  page-break-inside: avoid;
  padding: 0mm 1mm;
  overflow: hidden;
  box-sizing: border-box;
}
.half {
  width: ${HW}mm;
  height: ${H - 2}mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
}
.left-half {
  padding-left: 3.5mm;
  padding-right: 1mm;
  padding-top: 1mm;
  padding-bottom: 1mm;
  align-items: flex-start;
  text-align: left;
}
.right-half {
  padding-left: 1.5mm;
  padding-right: 1.5mm;
  padding-top: 0.5mm;
  padding-bottom: 0.5mm;
  align-items: center;
  text-align: center;
  justify-content: space-between;
}
.tail {
  width: ${TW}mm;
  flex-shrink: 0;
}
.brand {
  font-size: 1.8mm;
  font-weight: 900;
  letter-spacing: 0.1mm;
  line-height: 1;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
.bc-box {
  width: 100%;
  height: 8mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: visible;
}
.bc-box svg {
  width: 100%;
  max-width: 23mm;
  height: 8mm;
  display: block;
}
.sku {
  font-family: monospace, monospace;
  font-size: 1.8mm;
  font-weight: 900;
  text-align: center;
  line-height: 1;
  letter-spacing: 0.2mm;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
.purity {
  font-size: 1.8mm;
  font-weight: 900;
  line-height: 1;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
}
.item-name {
  font-size: 1.8mm;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
  text-transform: capitalize;
}
.weights {
  display: flex;
  flex-direction: column;
  gap: 0.3mm;
  font-size: 1.6mm;
  font-weight: bold;
  font-family: monospace, monospace;
  line-height: 1;
}
.huid {
  font-size: 1.5mm;
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
}
.price {
  font-size: 1.6mm;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
}
@media print {
  html, body { width: ${W}mm !important; height: ${H}mm !important; }
  .lc { width: ${W}mm !important; height: ${H}mm !important; }
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
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* LIVE ON-SCREEN SCANNER TEST CARD */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <ScanLine size={16} className="text-amber-600" />
                Live Scanner Screen Test
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                Scan your screen now!
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mb-3">
              Point your <strong>MJ2818C scanner</strong> directly at the barcode below to verify that it reads instantly:
            </p>

            <div className="bg-white rounded-lg p-3 border border-amber-200 flex flex-col items-center justify-center shadow-inner">
              <div className="text-[11px] font-bold text-charcoal-900 tracking-widest uppercase mb-1">AZEEZ JEWELS</div>
              <div ref={previewSvgRef} className="w-full flex items-center justify-center min-h-[50px]"></div>
              <div className="text-xs font-mono font-bold text-charcoal-900 tracking-widest mt-1">{barcodeText}</div>
            </div>

            {/* TEST INPUT FIELD */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Click here & trigger scanner to test read..."
                value={scannedTestResult}
                onChange={(e) => setScannedTestResult(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 bg-white"
              />
              {scannedTestResult && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded whitespace-nowrap">
                  ✓ Scanned: {scannedTestResult}
                </span>
              )}
            </div>
          </div>

          {/* TAG SIZE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
              1. Select Physical Tag / Label Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '50x12', label: '50mm × 12mm', desc: 'Standard Dumbbell' },
                { id: '81x12', label: '81mm × 12mm', desc: 'Extended Dumbbell' },
                { id: '100x15', label: '100mm × 15mm', desc: 'Chain / Ring Tag' },
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
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-900 uppercase tracking-wider text-[11px]">
              <Sliders size={14} className="text-slate-700" /> Windows TSC Driver & Chrome Print Settings
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium text-slate-700">
              <li>In Chrome Print: Set <strong>Margins: None</strong>, <strong>Scale: 100%</strong>, and uncheck <strong>Headers & Footers</strong></li>
              <li>In Windows <i>TSC Printer Preferences → Stock/Media</i>: Set <strong>Type: Labels with Gaps</strong> (Gap: 2mm)</li>
              <li>In Windows <i>TSC Printer Preferences → Graphics</i>: Set <strong>Dithering: None</strong> (Threshold) for pitch-black thermal bars</li>
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
