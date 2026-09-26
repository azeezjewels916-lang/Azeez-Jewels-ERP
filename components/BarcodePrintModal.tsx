import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Tag, Check, Sliders, ScanLine, Eye, Copy, Layers } from 'lucide-react';
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
      width: encodeMode === 'numeric' ? 1.5 : (format === 'CODE39' ? 1.0 : 1.15),
      height: 28,       // ~3.8mm bar height fitting cleanly with brand, item, purity, SKU, weights on one flap
      displayValue: false,
      margin: encodeMode === 'numeric' ? 3 : 2,
      background: "#ffffff",
      lineColor: "#000000"
    });

    svgNode.setAttribute("style", "width: 100%; height: 3.8mm; display: block; margin: 0 auto;");
    svgNode.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgNode.setAttribute("shape-rendering", "crispEdges");

    return { svgHtml: svgNode.outerHTML, encodedValue: valueToEncode };
  } catch (e) {
    console.error("Barcode SVG generation error:", e);
    return {
      svgHtml: `<svg viewBox="0 0 100 28"><rect width="100%" height="100%" fill="#fff"/></svg>`,
      encodedValue: rawText
    };
  }
}

// Embedded 1-bit crisp thermal monochrome logo (481x258) for instant 203 DPI thermal printing
const AZEEZ_LOGO_BASE64 = "data:image/png;base64,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";

export type TagLayout = 'logo-left-details-right' | 'details-left-logo-right' | 'duplicate' | 'barcode-left-details-right';

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
  const [tagLayout, setTagLayout] = useState<TagLayout>('logo-left-details-right');
  const [isRotated180, setIsRotated180] = useState<boolean>(false);
  const [scannedTestResult, setScannedTestResult] = useState<string>('');
  const previewSvgRef = useRef<HTMLDivElement>(null);
  const previewBackSvgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPrintQuantity(1);
      setScannedTestResult('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && item) {
      const barcodeText = (item.barcode || 'AHS000000').trim();
      const { svgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode);
      if (previewSvgRef.current) {
        previewSvgRef.current.innerHTML = svgHtml;
      }
      if (previewBackSvgRef.current) {
        previewBackSvgRef.current.innerHTML = svgHtml;
      }
    }
  }, [isOpen, item, barcodeFormat, encodeMode, tagLayout]);

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
    const tailW = 45;
    const headW = 47;
    const isTailLeft = tailPosition === 'left';

    // FLAP A: BRAND LOGO (Official Azeez Jewels emblem + Store Name + Phone)
    const flapLogoHtml = `
      <div class="flap flap-logo">
        <div class="logo-brand-box">
          <img src="${AZEEZ_LOGO_BASE64}" class="thermal-logo-img" alt="Azeez Jewels" />
        </div>
        <div class="logo-brand-name">AZEEZ JEWELS</div>
        <div class="logo-subline">SHIVAJI NAGAR • BLR</div>
        <div class="logo-phone">PH: 9916667573</div>
      </div>
    `;

    // FLAP B: ALL DETAILS & BARCODE (Everything on one single folded face)
    const flapDetailsHtml = `
      <div class="flap flap-details">
        <div class="row-item-purity">
          <span class="item-name">${item.item_name}</span>
          <span class="purity">${item.purity || '22K 916'}</span>
        </div>
        <div class="bc-box">
          ${barcodeSvgHtml}
        </div>
        <div class="sku-row ${showPrice && item.net_price ? 'sku-row-split' : 'sku-row-center'}">
          <span class="sku">${barcodeText}</span>
          ${showPrice && item.net_price ? `<span class="price-mini">₹${item.net_price.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <div class="weights-row">
          <span>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
          <span>Nt: ${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
        </div>
        ${showHUID && item.huid ? `<div class="huid-mini">HUID: ${item.huid}</div>` : ''}
      </div>
    `;

    // FLAP C: Split mode (classic barcode on left, text details on right)
    const flapBarcodeLeftHtml = `
      <div class="flap flap-barcode-left">
        <div class="brand">AZEEZ JEWELS</div>
        <div class="bc-box-lg">
          ${barcodeSvgHtml}
        </div>
        <div class="sku">${barcodeText}</div>
      </div>
    `;

    const flapTextDetailsRightHtml = `
      <div class="flap flap-text-right">
        <div class="purity">${item.purity || '22K 916'}</div>
        <div class="item-name">${item.item_name}</div>
        <div class="weights">
          <div>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</div>
          <div>Nt: ${(item.net_weight || item.weight || 0).toFixed(3)}g</div>
        </div>
        ${showHUID && item.huid ? `<div class="huid">HUID: ${item.huid}</div>` : ''}
        ${showPrice && item.net_price ? `<div class="price">₹ ${item.net_price.toLocaleString('en-IN')}</div>` : ''}
      </div>
    `;

    // Determine left and right flaps based on selected tagLayout
    let leftFlap = flapLogoHtml;
    let rightFlap = flapDetailsHtml;

    if (tagLayout === 'logo-left-details-right') {
      leftFlap = flapLogoHtml;
      rightFlap = flapDetailsHtml;
    } else if (tagLayout === 'details-left-logo-right') {
      leftFlap = flapDetailsHtml;
      rightFlap = flapLogoHtml;
    } else if (tagLayout === 'duplicate') {
      leftFlap = flapDetailsHtml;
      rightFlap = flapDetailsHtml;
    } else if (tagLayout === 'barcode-left-details-right') {
      leftFlap = flapBarcodeLeftHtml;
      rightFlap = flapTextDetailsRightHtml;
    }

    const labelHtml = Array.from({ length: printQuantity }).map((_, idx) => `
      <div class="lc ${isTailLeft ? 'tail-left' : 'tail-right'}" style="${idx === printQuantity - 1 ? 'page-break-after: avoid; page-break-inside: avoid;' : 'page-break-after: always; page-break-inside: avoid;'}">
        <!-- BLANK TAIL SECTION (45mm buffer wraps around ring/chain) -->
        <div class="tail-area"></div>

        <!-- SOLID RECTANGULAR HEAD (47mm x 15mm) -->
        <div class="head-area ${isRotated180 ? 'rot180' : ''}">
          ${isTailLeft ? leftFlap + rightFlap : rightFlap + leftFlap}
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
  padding: 1.8mm 0.8mm 0.8mm 0.8mm;
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
  height: 12.4mm;
  flex-shrink: 0;
}
.head-area {
  width: ${headW}mm;
  height: 12.4mm;
  max-height: 12.4mm;
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
.flap {
  width: 23.0mm;
  height: 12.4mm;
  max-height: 12.4mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 0.4mm;
}
.flap-logo {
  align-items: center;
  text-align: center;
  justify-content: space-between;
  padding: 0.3mm 0.5mm 0.3mm 0.5mm;
}
.logo-brand-box {
  width: 100%;
  height: 5.6mm;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.thermal-logo-img {
  max-width: 100%;
  max-height: 5.6mm;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  display: block;
  margin: 0 auto;
}
.logo-brand-name {
  font-size: 1.75mm;
  font-weight: 900;
  letter-spacing: 0.12mm;
  line-height: 1.0;
  text-transform: uppercase;
  color: #000000 !important;
  -webkit-text-stroke: 0.18px #000000;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
.logo-subline {
  font-size: 1.3mm;
  font-weight: 900;
  letter-spacing: 0.08mm;
  line-height: 1.0;
  text-transform: uppercase;
  color: #000000 !important;
  white-space: nowrap;
  overflow: hidden;
}
.logo-phone {
  font-size: 1.35mm;
  font-weight: 900;
  letter-spacing: 0.08mm;
  line-height: 1.0;
  color: #000000 !important;
  white-space: nowrap;
  overflow: hidden;
}
.brand, .purity, .item-name, .weights-row, .sku, .huid, .price-mini, .price, .phone, .huid-mini {
  color: #000000 !important;
  -webkit-text-stroke: 0.18px #000000;
  text-rendering: geometricPrecision;
  font-family: Arial, 'Segoe UI', Helvetica, sans-serif;
}
.brand {
  font-size: 1.75mm;
  font-weight: 900;
  letter-spacing: 0.12mm;
  line-height: 1.0;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
.row-item-purity {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  line-height: 1.0;
}
.item-name {
  font-size: 1.6mm;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  max-width: 13.5mm;
}
.purity {
  font-size: 1.6mm;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
}
.bc-box {
  width: 100%;
  height: 4.0mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
}
.bc-box svg {
  width: 100%;
  height: 4.0mm;
  display: block;
}
.bc-box-lg {
  width: 100%;
  height: 5.4mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
}
.bc-box-lg svg {
  width: 100%;
  height: 5.4mm;
  display: block;
}
.sku-row {
  display: flex;
  align-items: center;
  width: 100%;
  line-height: 1.0;
}
.sku-row-center {
  justify-content: center;
}
.sku-row-split {
  justify-content: space-between;
}
.sku {
  font-size: 1.55mm;
  font-weight: 900;
  text-align: center;
  line-height: 1.0;
  letter-spacing: 0.2mm;
  white-space: nowrap;
  overflow: hidden;
}
.price-mini {
  font-size: 1.5mm;
  font-weight: 900;
  text-align: right;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
}
.weights-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.5mm;
  font-weight: 900;
  line-height: 1.0;
}
.huid-mini {
  font-size: 1.35mm;
  font-weight: 900;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
}
.weights {
  display: flex;
  flex-direction: column;
  gap: 0.2mm;
  font-size: 1.6mm;
  font-weight: 900;
  line-height: 1.1;
}
.price {
  font-size: 1.65mm;
  font-weight: 900;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
}
.huid {
  font-size: 1.5mm;
  font-weight: 900;
  line-height: 1.0;
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
                Live Folded Tag & Scanner Preview
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                Logo Left • Details Right
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mb-3">
              When folded onto an ornament at the <strong>dashed green fold line</strong>: Left flap displays the Store Logo, and Right flap displays all details & barcode:
            </p>

            {/* VISUAL TAG SIMULATION */}
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-300 flex flex-col items-center justify-center">
              <div
                className={`w-full max-w-[480px] h-[76px] bg-white rounded border border-gray-400 shadow flex overflow-hidden ${
                  tailPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* TAIL (42%) */}
                <div className="w-[42%] bg-slate-200/90 border-r border-dashed border-slate-300 flex flex-col items-center justify-center p-1 text-center select-none">
                  <div className="w-full h-3 bg-white rounded-full border border-slate-300 shadow-inner"></div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                    Tail (Loops in Ring)
                  </span>
                </div>

                {/* SOLID RECTANGULAR HEAD (58%) */}
                <div className="w-[58%] h-full flex bg-white relative">
                  {/* FLAP 1 (LEFT SIDE OF HEAD) */}
                  <div className="w-[50%] h-full p-1 flex flex-col justify-between items-center text-center bg-amber-50/20">
                    {tagLayout === 'logo-left-details-right' ? (
                      <>
                        <div className="w-full h-[32px] flex items-center justify-center my-auto">
                          <img src="/logowithoutbg.png" alt="Azeez Jewels" className="max-h-[30px] max-w-[85%] object-contain filter contrast-125" />
                        </div>
                        <div className="text-[7.5px] font-black uppercase text-charcoal-900 leading-none">AZEEZ JEWELS</div>
                        <div className="text-[6.5px] font-bold text-gray-600 leading-none">PH: 9916667573</div>
                      </>
                    ) : tagLayout === 'duplicate' || tagLayout === 'details-left-logo-right' ? (
                      <>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black text-charcoal-900 px-0.5 leading-none">
                          <span className="truncate max-w-[55%]">{item.item_name}</span>
                          <span className="text-amber-800">{item.purity || '22K 916'}</span>
                        </div>
                        <div ref={previewSvgRef} className="w-full flex items-center justify-center max-h-[26px] my-auto"></div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black font-mono text-charcoal-900 px-0.5 leading-none">
                          <span>{barcodeText}</span>
                          {showPrice && item.net_price && (
                            <span className="text-emerald-800 font-sans">₹{item.net_price.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-mono font-bold text-charcoal-800 px-0.5 leading-none">
                          <span>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
                          <span>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</span>
                        </div>
                      </>
                    ) : (
                      /* barcode-left-details-right */
                      <>
                        <div className="text-[8px] font-black uppercase text-charcoal-900 leading-none">AZEEZ JEWELS</div>
                        <div ref={previewSvgRef} className="w-full flex items-center justify-center max-h-[32px] my-auto"></div>
                        <div className="text-[8.5px] font-mono font-black text-charcoal-900 leading-none">{barcodeText}</div>
                      </>
                    )}
                  </div>

                  {/* FOLD LINE INDICATOR */}
                  <div className="w-0 border-r-2 border-dashed border-emerald-500 relative flex items-center justify-center">
                    <span className="absolute -top-1 bg-emerald-600 text-white text-[7px] font-bold px-1 rounded-full uppercase tracking-tighter scale-90 whitespace-nowrap z-10">
                      FOLD
                    </span>
                  </div>

                  {/* FLAP 2 (RIGHT SIDE OF HEAD) */}
                  <div className="w-[50%] h-full p-1 flex flex-col justify-between items-center text-center">
                    {tagLayout === 'logo-left-details-right' ? (
                      <>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black text-charcoal-900 px-0.5 leading-none">
                          <span className="truncate max-w-[55%]">{item.item_name}</span>
                          <span className="text-amber-800">{item.purity || '22K 916'}</span>
                        </div>
                        <div ref={previewSvgRef} className="w-full flex items-center justify-center max-h-[26px] my-auto"></div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black font-mono text-charcoal-900 px-0.5 leading-none">
                          <span>{barcodeText}</span>
                          {showPrice && item.net_price && (
                            <span className="text-emerald-800 font-sans">₹{item.net_price.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-mono font-bold text-charcoal-800 px-0.5 leading-none">
                          <span>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
                          <span>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</span>
                        </div>
                      </>
                    ) : tagLayout === 'details-left-logo-right' ? (
                      <>
                        <div className="w-full h-[32px] flex items-center justify-center my-auto">
                          <img src="/logowithoutbg.png" alt="Azeez Jewels" className="max-h-[30px] max-w-[85%] object-contain filter contrast-125" />
                        </div>
                        <div className="text-[7.5px] font-black uppercase text-charcoal-900 leading-none">AZEEZ JEWELS</div>
                        <div className="text-[6.5px] font-bold text-gray-600 leading-none">PH: 9916667573</div>
                      </>
                    ) : tagLayout === 'duplicate' ? (
                      <>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black text-charcoal-900 px-0.5 leading-none">
                          <span className="truncate max-w-[55%]">{item.item_name}</span>
                          <span className="text-amber-800">{item.purity || '22K 916'}</span>
                        </div>
                        <div ref={previewBackSvgRef} className="w-full flex items-center justify-center max-h-[26px] my-auto"></div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-black font-mono text-charcoal-900 px-0.5 leading-none">
                          <span>{barcodeText}</span>
                          {showPrice && item.net_price && (
                            <span className="text-emerald-800 font-sans">₹{item.net_price.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="w-full flex justify-between items-center text-[7.5px] font-mono font-bold text-charcoal-800 px-0.5 leading-none">
                          <span>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
                          <span>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</span>
                        </div>
                      </>
                    ) : (
                      /* barcode-left-details-right */
                      <div className="w-full h-full flex flex-col justify-between items-start text-left text-[7.5px] font-bold text-charcoal-900 px-1 py-0.5 leading-tight">
                        <div className="text-amber-800 font-black">{item.purity || '22K 916'}</div>
                        <div className="truncate w-full font-bold">{item.item_name}</div>
                        <div className="font-mono text-[7px] space-y-0.5">
                          <div>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</div>
                          <div>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</div>
                        </div>
                        {showPrice && item.net_price && (
                          <div className="font-black text-emerald-800">₹{item.net_price.toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOLD EXPLANATION BADGE */}
              <div className="mt-2 text-[10.5px] text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>
                  <strong>Folded Tag Behavior:</strong> Left side has the <strong>Brand Logo</strong> & right side has <strong>all Details & Barcode</strong>. When folded on an article, one face shows the Logo and the other face shows all details!
                </span>
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

          {/* TAG LAYOUT DESIGN SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Tag Layout Design</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                Active: Logo Left, Details Right
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'logo-left-details-right',
                  label: 'Logo Left • Details Right (Recommended)',
                  desc: 'Left flap has Brand Logo. Right flap has Barcode, Item, Purity & Weights.'
                },
                {
                  id: 'details-left-logo-right',
                  label: 'Details Left • Logo Right',
                  desc: 'Left flap has Barcode & Details. Right flap has Brand Logo.'
                },
                {
                  id: 'duplicate',
                  label: 'All Details on Both Flaps',
                  desc: 'Duplicate Barcode & All Details on both flaps (scannable from either side).'
                },
                {
                  id: 'barcode-left-details-right',
                  label: 'Barcode Left • Text Right',
                  desc: 'Classic split: Barcode on left, Purity & Weights on right.'
                }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTagLayout(opt.id as any)}
                  className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                    tagLayout === opt.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span>{opt.label}</span>
                    {tagLayout === opt.id && <Check size={12} className="text-gold-600" />}
                  </div>
                  <p className="text-[9px] font-normal text-gray-500 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CONTROLS: TAIL POSITION & FLIP 180 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Sticker Tail Position
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
                Text Rotation (180° Flip)
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
                Barcode Density
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
                Barcode Symbology
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
              <Sliders size={14} className="text-amber-700" /> Key Settings for Sharp, Dark Print (TVSE LP46 Dlite)
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-slate-700">
              <li>
                <strong>Darkness:</strong> Set Darkness to <strong>11 - 13</strong> in Printer Preferences (Darkness 8-9 is too low for synthetic plastic tags with resin ribbon).
              </li>
              <li>
                <strong>Print Speed:</strong> Lower Print Speed to <strong>2.0 in/sec (50 mm/sec)</strong> in the <i>Options</i> tab for deep, solid black ink melt.
              </li>
              <li>
                <strong>Dithering:</strong> Keep set to <strong>None</strong> in the <i>Graphics</i> tab.
              </li>
              <li>
                <strong>In Chrome Print Dialog:</strong> Destination: <code>SNBC TVSE LP46 Dlite</code>, Paper size: <code>barcode</code>, Margins: <code>None</code>, Scale: <code>100%</code>.
              </li>
              <li>
                <strong>Calibrate Sensor (Stop Empty Labels / Shifting):</strong> Turn OFF printer &rarr; hold the FEED button &rarr; turn ON printer &rarr; wait for light to blink once &rarr; release FEED.
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


