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

export type TagShape = 'flag' | 'dumbbell';
export type TagSize = '92x15' | '90x15' | '81x12' | '100x15' | '50x12' | '100x20';

/**
 * Generate a high-contrast vector SVG barcode for thermal printing.
 * Supports CODE128 and CODE39.
 */
function getBarcodeSvgString(rawText: string, format: 'CODE128' | 'CODE39' = 'CODE128', encodeMode: 'full' | 'numeric' = 'full'): { svgHtml: string; encodedValue: string } {
  try {
    const fullText = (rawText || 'AHS000000').trim();
    const digitsOnly = fullText.replace(/\D/g, '');
    let valueToEncode = fullText;

    if (encodeMode === 'numeric' && digitsOnly.length >= 3) {
      valueToEncode = digitsOnly;
    } else if (format === 'CODE39') {
      valueToEncode = fullText.toUpperCase();
    } else {
      valueToEncode = fullText;
    }

    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svgNode, valueToEncode, {
      format: format,
      width: encodeMode === 'numeric' ? 2.2 : (format === 'CODE39' ? 1.2 : 1.4), // Wide module width for thermal contrast
      height: 46,       // Tall bars for easy laser scan capture
      displayValue: false,
      margin: encodeMode === 'numeric' ? 6 : 4, // Clean quiet zones
      background: "#ffffff",
      lineColor: "#000000"
    });

    svgNode.setAttribute("style", "width: 100%; height: 6.8mm; display: block; margin: 0 auto;");
    svgNode.setAttribute("preserveAspectRatio", "none");
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
  const [tagShape, setTagShape] = useState<TagShape>('flag');
  const [tagSize, setTagSize] = useState<TagSize>('92x15');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'CODE39'>('CODE128');
  const [encodeMode, setEncodeMode] = useState<'full' | 'numeric'>('numeric');
  const [printQuantity, setPrintQuantity] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showHUID, setShowHUID] = useState<boolean>(true);
  const [tailPosition, setTailPosition] = useState<'left' | 'right'>('left');
  const [isRotated180, setIsRotated180] = useState<boolean>(false);
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
      const { svgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode);
      previewSvgRef.current.innerHTML = svgHtml;
    }
  }, [isOpen, item, barcodeFormat, encodeMode]);

  if (!isOpen || !item) return null;

  const barcodeText = (item.barcode || 'AHS000000').trim();
  const { svgHtml: barcodeSvgHtml, encodedValue } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print barcodes.");
      return;
    }

    const W = 92;
    const H = 15;
    const tailW = 40;
    const headW = 52;
    const isTailLeft = tailPosition === 'left';

    const labelHtml = Array.from({ length: printQuantity }).map((_, idx) => `
      <div class="lc ${isTailLeft ? 'tail-left' : 'tail-right'}" style="${idx === printQuantity - 1 ? 'page-break-after: avoid; page-break-inside: avoid;' : 'page-break-after: always; page-break-inside: avoid;'}">
        <!-- BLANK TAIL SECTION (40mm) -->
        <div class="tail-area"></div>

        <!-- SOLID RECTANGULAR HEAD (52mm x 15mm) -->
        <div class="head-area ${isRotated180 ? 'rot180' : ''}">
          <!-- SUB-COL 1: BRAND + BARCODE + SKU -->
          <div class="col col-barcode">
            <div class="brand">AZEEZ JEWELS</div>
            <div class="bc-box">
              ${barcodeSvgHtml}
            </div>
            <div class="sku">${barcodeText}</div>
          </div>

          <!-- SUB-COL 2: ITEM DETAILS -->
          <div class="col col-details">
            <div class="purity">${item.purity || '22K 916'}</div>
            <div class="item-name">${item.item_name}</div>
            <div class="weights">
              <div>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</div>
              <div>Nt: ${(item.net_weight || item.weight || 0).toFixed(3)}g</div>
            </div>
            ${showHUID && item.huid ? `<div class="huid">HUID: ${item.huid}</div>` : ''}
            ${showPrice && item.net_price ? `<div class="price">₹ ${item.net_price.toLocaleString()}</div>` : ''}
          </div>
        </div>
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
  width: ${W}mm !important;
  height: ${H}mm !important;
  max-height: ${H}mm !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden !important;
}
.lc {
  width: ${W}mm !important;
  height: ${H}mm !important;
  max-height: ${H}mm !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2mm 0.8mm;
  overflow: hidden !important;
  box-sizing: border-box;
  page-break-inside: avoid !important;
}
.tail-left {
  flex-direction: row;
}
.tail-right {
  flex-direction: row-reverse;
}
.tail-area {
  width: ${tailW}mm;
  height: 12.6mm;
  flex-shrink: 0;
}
.head-area {
  width: ${headW}mm;
  height: 12.6mm;
  max-height: 12.6mm;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}
.rot180 {
  transform: rotate(180deg);
}
.col {
  height: 12.6mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
}
.col-barcode {
  width: 27mm;
  align-items: center;
  text-align: center;
  padding: 0 0.5mm;
}
.col-details {
  width: 24mm;
  align-items: flex-start;
  text-align: left;
  padding: 0 0.5mm 0 1.5mm;
  border-left: 0.2mm dashed #cccccc;
}
.brand {
  font-size: 1.7mm;
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
  height: 6.8mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
  margin: 0.2mm 0;
}
.bc-box svg {
  width: 100%;
  height: 6.8mm;
  display: block;
}
.sku {
  font-family: monospace, monospace;
  font-size: 1.7mm;
  font-weight: 900;
  text-align: center;
  line-height: 1;
  letter-spacing: 0.2mm;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
.purity {
  font-size: 1.7mm;
  font-weight: 900;
  line-height: 1;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
}
.item-name {
  font-size: 1.6mm;
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
  gap: 0.2mm;
  font-size: 1.5mm;
  font-weight: bold;
  font-family: monospace, monospace;
  line-height: 1;
}
.huid {
  font-size: 1.4mm;
  font-weight: bold;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
}
.price {
  font-size: 1.5mm;
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
  }, 250);
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
              <p className="text-[10px] text-gold-500 uppercase tracking-widest font-bold">TVS LP 46 Dlite Plus & Gobbler MJ2818A</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* LIVE ON-SCREEN SCANNER & VISUAL TAG PREVIEW CARD */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <ScanLine size={16} className="text-amber-600" />
                Live Tag & Scanner Preview (Gobbler MJ2818A)
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                Scan your screen now!
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mb-3">
              This visual preview matches your physical <strong>92mm × 15mm Flag Roll (Batch PW02072025)</strong>:
            </p>

            {/* VISUAL TAG SIMULATION */}
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-300 flex items-center justify-center">
              <div
                className={`w-full max-w-[460px] h-[72px] bg-white rounded border border-gray-400 shadow flex overflow-hidden ${
                  tailPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* TAIL (40%) */}
                <div className="w-[42%] bg-slate-200/90 border-r border-dashed border-slate-300 flex flex-col items-center justify-center p-1 text-center select-none">
                  <div className="w-full h-3 bg-white rounded-full border border-slate-300 shadow-inner"></div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                    Tail (40mm)
                  </span>
                </div>

                {/* HEAD (58%) */}
                <div className="w-[58%] h-full p-1.5 flex items-center justify-between bg-white">
                  {/* COL 1: BARCODE */}
                  <div className="w-[50%] h-full flex flex-col justify-between items-center text-center pr-1 border-r border-dashed border-gray-200">
                    <div className="text-[8.5px] font-black uppercase text-charcoal-900 leading-none">AZEEZ JEWELS</div>
                    <div ref={previewSvgRef} className="w-full flex items-center justify-center max-h-[36px] my-auto"></div>
                    <div className="text-[9px] font-mono font-black text-charcoal-900 leading-none tracking-tight">{barcodeText}</div>
                  </div>

                  {/* COL 2: DETAILS */}
                  <div className="w-[50%] h-full flex flex-col justify-between items-start text-left pl-1.5 text-[8.5px] font-bold text-charcoal-900 leading-tight">
                    <div className="text-amber-800 font-black">{item.purity || '22K 916'}</div>
                    <div className="truncate w-full font-bold">{item.item_name}</div>
                    <div className="font-mono text-[8px] space-y-0.5">
                      <div>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</div>
                      <div>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</div>
                    </div>
                    {showPrice && item.net_price ? (
                      <div className="font-black text-emerald-800">₹{item.net_price.toLocaleString()}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* TEST INPUT FIELD FOR SCANNER */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Click here & trigger Gobbler scanner to test read..."
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

          {/* CONTROLS: TAIL POSITION & FLIP 180 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                1. Sticker Tail Position
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'left', label: 'Tail Left / Head Right' },
                  { id: 'right', label: 'Tail Right / Head Left' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTailPosition(opt.id as any)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${tailPosition === opt.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {tailPosition === opt.id && <Check size={12} className="text-gold-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                2. Text Rotation (180° Flip)
              </label>
              <div className="space-y-1.5">
                {[
                  { id: false, label: 'Normal (Brand on Top)' },
                  { id: true, label: 'Invert 180° (Flip Upside Down)' }
                ].map((opt) => (
                  <button
                    key={String(opt.id)}
                    onClick={() => setIsRotated180(opt.id)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${isRotated180 === opt.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isRotated180 === opt.id && <Check size={12} className="text-gold-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BARCODE ENCODING MODE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                3. Barcode Density
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'numeric', label: 'Numeric (Digits Only - Fast Scan)', desc: 'Thickest bars for instant reading' },
                  { id: 'full', label: 'Full SKU (Letters + Digits)', desc: 'Encodes full SKU e.g. AHS464454' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setEncodeMode(opt.id as any)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${encodeMode === opt.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {encodeMode === opt.id && <Check size={12} className="text-gold-600" />}
                    </div>
                    <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                4. Barcode Symbology
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'CODE128', label: 'Code 128 (Recommended)', desc: 'Standard retail format' },
                  { id: 'CODE39', label: 'Code 39 (Universal 1D)', desc: 'Widely supported format' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setBarcodeFormat(opt.id as any)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${barcodeFormat === opt.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {barcodeFormat === opt.id && <Check size={12} className="text-gold-600" />}
                    </div>
                    <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CRITICAL WINDOWS DRIVER SETTINGS BANNER */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-slate-800 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 uppercase tracking-wider text-[11px]">
              <Sliders size={14} className="text-amber-700" /> Fix: Stop Empty Labels on TVS LP 46 Dlite
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-slate-700">
              <li>
                <strong>Check Height in Windows Stock:</strong> In Windows <i>Printing Preferences $\rightarrow$ Page Setup $\rightarrow$ barcode</i> stock, ensure <strong>Width = 92.0 mm</strong> and <strong>Height = 15.0 mm</strong> (make sure height is NOT 150mm or 15cm!).
              </li>
              <li>
                <strong>Stock Type:</strong> Must be set to <strong>Labels with Gaps / Die-cut</strong> (Gap: <strong>2.0 mm</strong>), NOT "Continuous".
              </li>
              <li>
                <strong>Driver Orientation:</strong> Must be set to <strong>Portrait</strong> (NOT Landscape).
              </li>
              <li>
                <strong>In Chrome Print Dialog:</strong> Destination: <code>SNBC TVSE LP46 Dlite</code>, Paper size: <code>barcode</code>, Margins: <code>None</code>, Scale: <code>100%</code>.
              </li>
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
            <Printer size={16} className="mr-2" /> Print Tag on TVS LP 46 Dlite Plus
          </Button>
        </div>
      </div>
    </div>
  );
};

