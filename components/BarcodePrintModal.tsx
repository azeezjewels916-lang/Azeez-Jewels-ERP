import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Tag, Check, Sliders, ScanLine, Eye, Copy, Layers, ShieldCheck, Type } from 'lucide-react';
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
export type FontPreset = 'verdana' | 'consolas' | 'segoe' | 'arial';
export type FontWeightChoice = '700' | '600' | '800';
export type TextCaseChoice = 'uppercase' | 'capitalize';
export type WeightFontSize = 'normal' | 'large' | 'xlarge';

export const getFontFamilyCss = (preset: FontPreset): { primary: string; mono: string } => {
  switch (preset) {
    case 'verdana':
      return {
        primary: "Verdana, Geneva, 'DejaVu Sans', sans-serif",
        mono: "Consolas, 'Segoe UI Mono', monospace"
      };
    case 'consolas':
      return {
        primary: "Consolas, 'Segoe UI Mono', monospace",
        mono: "Consolas, 'Segoe UI Mono', monospace"
      };
    case 'segoe':
      return {
        primary: "'Segoe UI', Arial, sans-serif",
        mono: "Consolas, 'Segoe UI Mono', monospace"
      };
    case 'arial':
      return {
        primary: "Arial, Helvetica, sans-serif",
        mono: "Consolas, 'Segoe UI Mono', monospace"
      };
    default:
      return {
        primary: "Verdana, Geneva, sans-serif",
        mono: "Consolas, 'Segoe UI Mono', monospace"
      };
  }
};

// High-contrast 1-bit monochrome thermal brand logo for Azeez Jewels (AHS crest + flourish)
const AZEEZ_LOGO_THERMAL_BASE64 = `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`;

/**
 * Generate a high-contrast vector SVG barcode for thermal printing.
 * Configured for instant reading on 203 DPI handheld laser & CCD barcode scanners.
 */
function getBarcodeSvgString(
  rawText: string,
  format: 'CODE128' | 'CODE39' = 'CODE128',
  encodeMode: 'full' | 'numeric' = 'numeric',
  heightMm: number = 4.0
): { svgHtml: string; encodedValue: string } {
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

    const isLarge = heightMm >= 5.0;
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svgNode, valueToEncode, {
      format: format,
      width: encodeMode === 'numeric' ? (isLarge ? 1.4 : 1.35) : (format === 'CODE39' ? (isLarge ? 1.05 : 1.0) : (isLarge ? 1.25 : 1.15)),
      height: isLarge ? 40 : 30,
      displayValue: false,
      margin: 0,
      background: "#ffffff",
      lineColor: "#000000"
    });

    // Remove fixed width/height attributes so CSS width: 100% controls size
    svgNode.removeAttribute("width");
    svgNode.removeAttribute("height");
    svgNode.setAttribute("style", `width: 100%; height: ${heightMm}mm; display: block; margin: 0 auto;`);
    svgNode.setAttribute("preserveAspectRatio", "none");
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

export type TagLayout = 'details-left-barcode-right' | 'brand-left-details-right' | 'barcode-left-details-right' | 'duplicate';

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const [tagShape, setTagShape] = useState<TagShape>('dumbbell');
  const [tagSize, setTagSize] = useState<TagSize>('92x15');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'CODE39'>('CODE128');
  const [encodeMode, setEncodeMode] = useState<'full' | 'numeric'>('numeric');
  const [printQuantity, setPrintQuantity] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(false);
  const [showHUID, setShowHUID] = useState<boolean>(false);
  // Default tailPosition to 'right' (Head Left, Tail Right) as physically mounted on the TVSE LP46 Dlite
  const [tailPosition, setTailPosition] = useState<'left' | 'right'>('right');
  const [tagLayout, setTagLayout] = useState<TagLayout>('details-left-barcode-right');
  const [leftBrandStyle, setLeftBrandStyle] = useState<'logo' | 'text'>('logo');
  // Fold clearance gap in mm between Left Flap and Right Flap (protects the physical fold line)
  const [foldGapMm, setFoldGapMm] = useState<number>(7.0);
  const [isRotated180, setIsRotated180] = useState<boolean>(false);
  // Typography & Sharpness Options for Anti-Blobbing
  const [fontPreset, setFontPreset] = useState<FontPreset>('verdana');
  const [fontWeight, setFontWeight] = useState<FontWeightChoice>('700');
  const [textCase, setTextCase] = useState<TextCaseChoice>('capitalize');
  const [weightFontSize, setWeightFontSize] = useState<WeightFontSize>('large');
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
      const isBigBarcode = tagLayout === 'details-left-barcode-right';
      const { svgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode, isBigBarcode ? 5.5 : 4.0);
      if (previewSvgRef.current) {
        previewSvgRef.current.innerHTML = svgHtml;
      }
      if (previewBackSvgRef.current) {
        previewBackSvgRef.current.innerHTML = svgHtml;
      }
    }
  }, [isOpen, item, barcodeFormat, encodeMode, tagLayout, foldGapMm, leftBrandStyle, fontPreset, fontWeight, textCase, weightFontSize]);

  if (!isOpen || !item) return null;

  const barcodeText = (item.barcode || 'AHS000000').trim();
  const { svgHtml: barcodeSvgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode);

  // Clean item name for crisp printing (Title Case, e.g. "Earrings", "Nose Pin")
  const rawItemName = (item.item_name || 'Jewelry').replace(/\[.*?\]/g, '').trim() || item.item_name || 'Jewelry';
  const cleanItemName = rawItemName
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Format Purity matching reference (e.g., 750, 916, 999, 925)
  const formatTagPurity = (purityStr?: string) => {
    if (!purityStr) return '750';
    const trimmed = purityStr.trim();
    const match = trimmed.match(/\b(750|916|999|925|585|840)\b/);
    if (match) return match[1];
    const lower = trimmed.toLowerCase();
    if (lower.includes('18k')) return '750';
    if (lower.includes('22k')) return '916';
    if (lower.includes('24k')) return '999';
    if (lower.includes('14k')) return '585';
    return trimmed;
  };
  const cleanPurity = formatTagPurity(item.purity);

  // Format Weight matching reference (strictly 3 decimals: e.g. "1.910 gm.", never stripped or truncated)
  const parseNum = (v: any): number => {
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    if (!v) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  const itemWeightVal = parseNum(item.net_weight) || parseNum(item.gross_weight) || parseNum(item.weight) || 0;
  const formatTagWeight = (val: number) => {
    if (!val || val <= 0) return '0.000 gm.';
    return `${val.toFixed(3)} gm.`;
  };
  const cleanWeight = formatTagWeight(itemWeightVal);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print barcodes.");
      return;
    }

    const W = 92;
    const H = 15;
    const isTailOnRight = tailPosition === 'right';

    const { svgHtml: barcodeSvgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode, 4.0);
    const { svgHtml: largeBarcodeSvgHtml } = getBarcodeSvgString(barcodeText, barcodeFormat, encodeMode, 5.5);

    // 1. FLAP PRODUCT DETAILS (LEFT FLAP - EXACT 3-LINE PHOTO REFERENCE: Purity, Item, Weight)
    const flapProductDetailsHtml = `
      <div class="flap flap-left flap-product-details">
        <div class="ref-line">
          <span class="ref-lbl">Purity :</span>
          <span class="ref-val">${cleanPurity}</span>
        </div>
        <div class="ref-line">
          <span class="ref-lbl">Item :</span>
          <span class="ref-val">${cleanItemName}</span>
        </div>
        <div class="ref-line">
          <span class="ref-lbl">Weight :</span>
          <span class="ref-val">${cleanWeight}</span>
        </div>
        ${((showPrice && item.net_price) || (showHUID && item.huid)) ? `
          <div class="ref-extra-line">
            ${showPrice && item.net_price ? `<span>₹${item.net_price.toLocaleString('en-IN')}</span>` : '<span></span>'}
            ${showHUID && item.huid ? `<span>H:${item.huid}</span>` : '<span></span>'}
          </div>
        ` : ''}
      </div>
    `;

    // 2. FLAP HERO BARCODE (RIGHT FLAP - JUST BARCODE WITH APPROPRIATE BIGGER SIZING + SKU)
    const flapBarcodeHeroHtml = `
      <div class="flap flap-right flap-barcode-hero">
        <div class="bc-container-hero">
          ${largeBarcodeSvgHtml}
        </div>
        <div class="barcode-sku-hero">${barcodeText}</div>
      </div>
    `;

    // 3. FLAP BRAND ONLY (Alternative layout: Brand only on Left)
    const flapBrandHtml = leftBrandStyle === 'logo' ? `
      <div class="flap flap-left flap-brand">
        <img src="data:image/png;base64,${AZEEZ_LOGO_THERMAL_BASE64}" class="brand-logo-img" alt="Azeez Jewels" />
      </div>
    ` : `
      <div class="flap flap-left flap-brand">
        <div class="brand-text-name">AZEEZ JEWELS</div>
      </div>
    `;

    // 4. FLAP ALL DETAILS COMPACT (Alternative layout: Right flap with compact barcode & details)
    const flapDetailsHtml = `
      <div class="flap flap-right flap-details">
        <div class="details-top-row">
          <span class="item-name">${cleanItemName}</span>
          <span class="purity">${item.purity || '22K (916)'}</span>
        </div>
        <div class="bc-container">
          ${barcodeSvgHtml}
        </div>
        <div class="sku-row">
          <span class="sku">${barcodeText}</span>
          ${showPrice && item.net_price ? `<span class="price">₹${item.net_price.toLocaleString('en-IN')}</span>` : ''}
        </div>
        <div class="weights-row">
          <span>Gr: ${(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
          <span>Nt: ${(item.net_weight || item.weight || 0).toFixed(3)}g</span>
          ${showHUID && item.huid ? `<span class="huid">H:${item.huid}</span>` : ''}
        </div>
      </div>
    `;

    // Determine left and right flaps based on selected layout
    let leftFlap = flapProductDetailsHtml;
    let rightFlap = flapBarcodeHeroHtml;

    if (tagLayout === 'details-left-barcode-right') {
      leftFlap = flapProductDetailsHtml;
      rightFlap = flapBarcodeHeroHtml;
    } else if (tagLayout === 'brand-left-details-right') {
      leftFlap = flapBrandHtml;
      rightFlap = flapDetailsHtml;
    } else if (tagLayout === 'duplicate') {
      leftFlap = flapProductDetailsHtml;
      rightFlap = flapProductDetailsHtml;
    }

    const labelHtml = Array.from({ length: printQuantity }).map((_, idx) => `
      <div class="lc ${isTailOnRight ? 'head-left-tail-right' : 'tail-left-head-right'}" style="${idx === printQuantity - 1 ? 'page-break-after: avoid; page-break-inside: avoid;' : 'page-break-after: always; page-break-inside: avoid;'}">
        ${isTailOnRight ? `
          <!-- SOLID HEAD ON LEFT (50mm total printable) -->
          <div class="head-area ${isRotated180 ? 'rot180' : ''}">
            ${leftFlap}
            <!-- CRITICAL FOLD BUFFER ZONE (${foldGapMm}mm pure white gap protects the physical fold) -->
            <div class="fold-spacer" style="width: ${foldGapMm}mm;"></div>
            ${rightFlap}
          </div>
          <!-- BLANK TAIL BUFFER ON RIGHT (42mm) -->
          <div class="tail-area"></div>
        ` : `
          <!-- BLANK TAIL BUFFER ON LEFT (42mm) -->
          <div class="tail-area"></div>
          <!-- SOLID HEAD ON RIGHT (50mm total printable) -->
          <div class="head-area ${isRotated180 ? 'rot180' : ''}">
            ${leftFlap}
            <!-- CRITICAL FOLD BUFFER ZONE (${foldGapMm}mm pure white gap protects the physical fold) -->
            <div class="fold-spacer" style="width: ${foldGapMm}mm;"></div>
            ${rightFlap}
          </div>
        `}
      </div>
    `).join('');

    const fontFamilies = getFontFamilyCss(fontPreset);
    const weightFontSizeMm = weightFontSize === 'normal' ? '1.55mm' : weightFontSize === 'xlarge' ? '1.95mm' : '1.75mm';

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Tag - ${barcodeText}</title>
<style>
:root {
  --primary-font: ${fontFamilies.primary};
  --mono-font: ${fontFamilies.mono};
  --font-weight: ${fontWeight};
  --weight-font-size: ${weightFontSizeMm};
}
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
  font-family: var(--primary-font);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow: hidden !important;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.lc {
  width: ${W}mm !important;
  height: ${H}mm !important;
  max-height: ${H}mm !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden !important;
  page-break-inside: avoid !important;
}
.head-left-tail-right {
  padding: 2.8mm 1.0mm 0.8mm 2.2mm;
  justify-content: flex-start;
}
.tail-left-head-right {
  padding: 2.8mm 2.2mm 0.8mm 1.0mm;
  justify-content: flex-end;
}
.head-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 11.2mm;
  max-height: 11.2mm;
  box-sizing: border-box;
  overflow: hidden;
}
.tail-area {
  width: 40.0mm;
  height: 11.2mm;
  flex-shrink: 0;
}
.rot180 {
  transform: rotate(180deg);
}
/* FOLD SPACER: Guarantees zero text crosses the physical fold line */
.fold-spacer {
  height: 11.2mm;
  flex-shrink: 0;
  box-sizing: border-box;
}
.flap {
  height: 11.2mm;
  max-height: 11.2mm;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
}
/* FLAP 1 (LEFT): BRAND ONLY */
.flap-left {
  width: 20.0mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0.4mm;
}
.brand-logo-img {
  max-width: 19.2mm;
  max-height: 9.8mm;
  width: auto;
  height: auto;
  display: block;
  margin: auto;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  object-fit: contain;
}
.brand-text-name {
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 2.2mm;
  font-weight: 700;
  letter-spacing: 0.2mm;
  text-align: center;
  line-height: 1.1;
  text-transform: uppercase;
  color: #000000 !important;
  width: 100%;
}
/* FLAP: PRODUCT DETAILS ONLY (LEFT FLAP - EXACT 3-LINE PHOTO REFERENCE) */
.flap-product-details {
  width: 21.0mm;
  height: 11.2mm;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-evenly !important;
  align-items: flex-start !important;
  padding: 0.4mm 0.4mm 0.4mm 2.2mm;
  font-family: var(--primary-font);
  box-sizing: border-box;
  overflow: hidden;
}
.ref-line {
  display: flex;
  align-items: baseline;
  width: 100%;
  line-height: 1.2;
  font-family: var(--primary-font);
  font-size: 1.75mm;
  font-weight: 700;
  letter-spacing: 0.02mm;
  color: #000000 !important;
  white-space: nowrap;
}
.ref-lbl {
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 0.5mm;
  color: #000000 !important;
}
.ref-val {
  font-weight: 700;
  color: #000000 !important;
  white-space: nowrap;
}
.ref-extra-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 1.35mm;
  font-weight: 700;
  color: #000000 !important;
  line-height: 1.0;
}
/* FLAP: HERO BARCODE ONLY (RIGHT FLAP - CLEAN PROPORTIONATE SIZING) */
.flap-barcode-hero {
  width: 21.0mm;
  height: 11.2mm;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0.3mm 0.6mm 0.3mm 0.6mm;
  box-sizing: border-box;
  overflow: hidden;
}
.bc-container-hero {
  width: 90%;
  max-width: 18.5mm;
  height: 5.5mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
  margin: 0 auto;
}
.bc-container-hero svg {
  width: 100% !important;
  height: 5.5mm !important;
  display: block;
}
.barcode-sku-hero {
  font-family: var(--mono-font);
  font-size: 1.6mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.3mm;
  text-align: center;
  line-height: 1.0;
  margin-top: 0.5mm;
  white-space: nowrap;
  color: #000000 !important;
}
/* FLAP 2 (RIGHT): ALL DETAILS ON SINGLE FACE */
.flap-right {
  width: 21.0mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 0.4mm;
  font-family: var(--primary-font);
}
.details-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  line-height: 1.0;
}
.item-name {
  font-family: var(--primary-font);
  font-size: 1.65mm;
  font-weight: var(--font-weight);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: ${textCase};
  max-width: 12.0mm;
  letter-spacing: 0.15mm;
  color: #000000 !important;
}
.purity {
  font-family: var(--primary-font);
  font-size: 1.65mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.15mm;
  white-space: nowrap;
  text-align: right;
  color: #000000 !important;
}
.bc-container {
  width: 100%;
  height: 4.0mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
  margin: 0.15mm 0;
}
.bc-container svg {
  width: 100%;
  height: 4.0mm;
  display: block;
}
.sku-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  line-height: 1.0;
}
.sku {
  font-size: 1.55mm;
  font-weight: var(--font-weight);
  font-family: var(--mono-font);
  letter-spacing: 0.3mm;
  color: #000000 !important;
}
.price {
  font-family: var(--primary-font);
  font-size: 1.45mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.1mm;
  color: #000000 !important;
}
.weights-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-family: var(--primary-font);
  font-size: var(--weight-font-size);
  font-weight: var(--font-weight);
  letter-spacing: 0.1mm;
  line-height: 1.0;
  color: #000000 !important;
}
.huid {
  font-family: var(--mono-font);
  font-size: 1.3mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.15mm;
  color: #000000 !important;
}
.flap-barcode-only {
  width: 20.0mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}
.brand-header {
  font-family: var(--primary-font);
  font-size: 1.7mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.15mm;
  line-height: 1.0;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  color: #000000 !important;
}
.bc-container-lg {
  width: 100%;
  height: 5.0mm;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
}
.bc-container-lg svg {
  width: 100%;
  height: 5.0mm;
  display: block;
}
.sku-bottom {
  font-family: var(--mono-font);
  font-size: 1.55mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.25mm;
  text-align: center;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  color: #000000 !important;
}
.purity-header {
  font-family: var(--primary-font);
  font-size: 1.7mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.15mm;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
  color: #000000 !important;
}
.item-title {
  font-family: var(--primary-font);
  font-size: 1.6mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.15mm;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: ${textCase};
  color: #000000 !important;
}
.weights-block {
  display: flex;
  flex-direction: column;
  gap: 0.2mm;
  font-family: var(--primary-font);
  font-size: var(--weight-font-size);
  font-weight: var(--font-weight);
  letter-spacing: 0.1mm;
  line-height: 1.05;
  color: #000000 !important;
}
.price-bottom {
  font-family: var(--primary-font);
  font-size: 1.5mm;
  font-weight: var(--font-weight);
  letter-spacing: 0.1mm;
  line-height: 1.0;
  white-space: nowrap;
  overflow: hidden;
  color: #000000 !important;
}
</style>
</head>
<body>
${labelHtml}
<script>
window.onload = function() {
  window.focus();
  setTimeout(function() {
    window.print();
    window.close();
  }, 250);
};
</script>
</body>
</html>`);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-charcoal-900 to-charcoal-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Printer size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Jewellery Tag Thermal Print</h3>
              <p className="text-xs text-charcoal-300">
                Optimized for TVSE LP 46 Dlite (92mm × 15mm Dumbbell Tag)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* LIVE ON-SCREEN SCANNER & VISUAL TAG PREVIEW CARD */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <ScanLine size={16} className="text-amber-600" />
                Tag Preview & Fold Inspection
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                {tagLayout === 'details-left-barcode-right' ? 'Left: Details • Right: Big Barcode (Protected Fold)' : 'Brand Left • Details Right (Protected Fold)'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mb-2">
              {tagLayout === 'details-left-barcode-right' ? (
                <>Configured as requested: <strong>Left flap has Product Details only (no brand name), Right flap has Large Barcode</strong>. The green dashed line marks your fold:</>
              ) : (
                <>Matches your physical roll: <strong>Left flap has Brand only, Right flap has All Details</strong>. The green dashed line marks your fold:</>
              )}
            </p>

            {/* VISUAL TAG SIMULATION WITH ACCURATE FOLD GAP */}
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 flex flex-col items-center justify-center">
              <div
                className={`w-full max-w-[490px] h-[78px] bg-white rounded border border-gray-400 shadow flex overflow-hidden ${
                  tailPosition === 'right' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* SOLID RECTANGULAR HEAD (55%) */}
                <div className="w-[58%] h-full flex bg-white relative">
                  {/* FLAP 1 (LEFT SIDE OF HEAD - EXACT 3-LINE PHOTO REFERENCE) */}
                  {tagLayout === 'details-left-barcode-right' ? (
                    <div
                      className="w-[43%] h-full py-1.5 pl-3 pr-1 flex flex-col justify-evenly text-left bg-white"
                      style={{ fontFamily: getFontFamilyCss(fontPreset).primary }}
                    >
                      {/* Line 1: Purity : 750 */}
                      <div className="w-full flex items-baseline text-[9px] leading-tight text-charcoal-950 font-bold whitespace-nowrap">
                        <span className="shrink-0 mr-1 text-charcoal-800 font-extrabold">Purity :</span>
                        <span className="font-extrabold text-charcoal-950">{cleanPurity}</span>
                      </div>

                      {/* Line 2: Item : Ring */}
                      <div className="w-full flex items-baseline text-[9px] leading-tight text-charcoal-950 font-bold whitespace-nowrap">
                        <span className="shrink-0 mr-1 text-charcoal-800 font-extrabold">Item :</span>
                        <span className="font-extrabold text-charcoal-950 capitalize">{cleanItemName}</span>
                      </div>

                      {/* Line 3: Weight : 1.910 gm. */}
                      <div className="w-full flex items-baseline text-[9px] leading-tight text-charcoal-950 font-bold whitespace-nowrap">
                        <span className="shrink-0 mr-1 text-charcoal-800 font-extrabold">Weight :</span>
                        <span className="font-extrabold text-charcoal-950">{cleanWeight}</span>
                      </div>

                      {/* Price and/or HUID if explicitly checked */}
                      {((showPrice && item.net_price) || (showHUID && item.huid)) && (
                        <div className="w-full flex justify-between items-center text-[7.5px] leading-none text-emerald-800 font-bold pt-0.5">
                          {showPrice && item.net_price ? <span>₹{item.net_price.toLocaleString()}</span> : <span />}
                          {showHUID && item.huid && <span className="font-mono text-charcoal-600">H:{item.huid}</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-[43%] h-full p-1.5 flex flex-col items-center justify-center text-center bg-amber-50/20">
                      {leftBrandStyle === 'logo' ? (
                        <img
                          src={`data:image/png;base64,${AZEEZ_LOGO_THERMAL_BASE64}`}
                          alt="Azeez Jewels"
                          className="max-h-[46px] max-w-[95%] object-contain"
                        />
                      ) : (
                        <div className="font-serif font-black text-[10px] tracking-wider uppercase text-charcoal-900">
                          AZEEZ JEWELS
                        </div>
                      )}
                    </div>
                  )}

                  {/* FOLD BUFFER ZONE WITH GREEN DASHED LINE */}
                  <div className="w-[14%] h-full bg-emerald-50/60 border-x border-dashed border-emerald-300 relative flex items-center justify-center">
                    <div className="w-0 h-full border-r-2 border-dashed border-emerald-600 relative">
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[6.5px] font-black px-1 rounded-full uppercase whitespace-nowrap z-10 shadow-sm">
                        FOLD
                      </span>
                    </div>
                  </div>

                  {/* FLAP 2 (RIGHT SIDE OF HEAD) */}
                  {tagLayout === 'details-left-barcode-right' ? (
                    <div className="w-[43%] h-full py-1 px-1.5 flex flex-col justify-center items-center text-center bg-white">
                      <div
                        ref={previewBackSvgRef}
                        className="w-[88%] flex items-center justify-center max-h-[38px] my-auto [&>svg]:!h-[36px] [&>svg]:!w-full"
                      ></div>
                      <div
                        className="w-full text-center text-[8px] text-charcoal-900 leading-none mt-0.5 font-mono tracking-wider font-bold"
                        style={{
                          fontFamily: getFontFamilyCss(fontPreset).mono,
                          fontWeight: fontWeight === '600' ? 600 : fontWeight === '700' ? 700 : 800,
                        }}
                      >
                        {barcodeText}
                      </div>
                    </div>
                  ) : (
                    <div className="w-[43%] h-full p-1 flex flex-col justify-between items-center text-center" style={{ fontFamily: getFontFamilyCss(fontPreset).primary }}>
                      <div
                        className="w-full flex justify-between items-center text-[7.5px] text-charcoal-900 px-0.5 leading-none"
                        style={{
                          fontWeight: fontWeight === '600' ? 600 : fontWeight === '700' ? 700 : 800,
                          letterSpacing: '0.2px'
                        }}
                      >
                        <span className={`truncate max-w-[55%] ${textCase === 'uppercase' ? 'uppercase font-bold' : 'capitalize font-bold'}`}>{cleanItemName}</span>
                        <span className="text-amber-800 font-bold">{item.purity || '22K (916)'}</span>
                      </div>
                      <div ref={previewBackSvgRef} className="w-full flex items-center justify-center max-h-[26px] my-auto [&>svg]:!h-[24px] [&>svg]:!w-full"></div>
                      <div
                        className="w-full flex justify-between items-center text-[7.5px] text-charcoal-900 px-0.5 leading-none"
                        style={{
                          fontFamily: getFontFamilyCss(fontPreset).mono,
                          fontWeight: fontWeight === '600' ? 600 : fontWeight === '700' ? 700 : 800,
                          letterSpacing: '0.6px'
                        }}
                      >
                        <span className="font-bold">{barcodeText}</span>
                        {showPrice && item.net_price && (
                          <span className="text-emerald-800 font-bold" style={{ fontFamily: getFontFamilyCss(fontPreset).primary }}>₹{item.net_price.toLocaleString()}</span>
                        )}
                      </div>
                      <div
                        className={`w-full flex justify-between items-center font-bold text-charcoal-800 px-0.5 leading-none ${
                          weightFontSize === 'xlarge' ? 'text-[9.5px]' : weightFontSize === 'large' ? 'text-[8.5px]' : 'text-[7.5px]'
                        }`}
                        style={{
                          fontWeight: fontWeight === '600' ? 600 : fontWeight === '700' ? 700 : 800,
                          letterSpacing: '0.2px'
                        }}
                      >
                        <span>Gr: {(item.gross_weight || item.weight || 0).toFixed(3)}g</span>
                        <span>Nt: {(item.net_weight || item.weight || 0).toFixed(3)}g</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* TAIL LOOP (42%) */}
                <div className="w-[42%] bg-slate-200/90 border-l border-dashed border-slate-300 flex flex-col items-center justify-center p-1 text-center select-none">
                  <div className="w-full h-3 bg-white rounded-full border border-slate-300 shadow-inner"></div>
                  <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                    Tail Loop (40mm)
                  </span>
                </div>
              </div>

              {/* FOLD EXPLANATION BADGE */}
              <div className="mt-2 text-[10.5px] text-slate-700 bg-white border border-emerald-300 rounded-md px-2.5 py-1.5 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>Protected Fold Clearance:</strong> The right flap starts <strong>{foldGapMm}mm</strong> to the right, ensuring barcode and text never cross over the green fold line!
                </span>
              </div>
            </div>

            {/* TEST INPUT FIELD FOR SCANNER */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Click here & trigger Gobbler / TVS scanner to test read..."
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

          {/* TAG LAYOUT SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                Tag Layout & Face Organization
              </label>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Fold Protected (7mm Gap)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTagLayout('details-left-barcode-right')}
                className={`p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                  tagLayout === 'details-left-barcode-right'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Left: Details • Right: Big Barcode
                  </span>
                  {tagLayout === 'details-left-barcode-right' && <Check size={13} className="text-emerald-600 shrink-0" />}
                </div>
                <p className="text-[10px] font-normal text-emerald-900/80">
                  Left: 3-Line Details (Purity, Item, Weight gm.). Right: Dedicated big barcode for quick scanning.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTagLayout('brand-left-details-right')}
                className={`p-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                  tagLayout === 'brand-left-details-right'
                    ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm ring-1 ring-gold-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                    Left: Brand • Right: Details
                  </span>
                  {tagLayout === 'brand-left-details-right' && <Check size={13} className="text-gold-600 shrink-0" />}
                </div>
                <p className="text-[10px] font-normal text-gray-500">
                  Left: Azeez Jewels hallmark. Right: Item details and compact barcode together.
                </p>
              </button>
            </div>
          </div>

          {/* FOLD CLEARANCE GAP CONTROLLER */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>Fold Clearance Gap (Prevents Details Crossing Green Fold)</span>
              </label>
              <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {foldGapMm} mm
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 5.5, label: '5.5 mm' },
                { val: 6.5, label: '6.5 mm' },
                { val: 7.0, label: '7.0 mm (Recommended)' },
                { val: 8.0, label: '8.0 mm (Wider)' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFoldGapMm(opt.val)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                    foldGapMm === opt.val
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-100/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* BRAND DISPLAY STYLE ON LEFT FLAP (Shown when brand layout is active) */}
          {tagLayout === 'brand-left-details-right' ? (
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Brand Style on Left Flap
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'logo', label: 'Official Brand Emblem', desc: 'AHS Royal Crest + AZEEZ JEWELS hallmark' },
                  { id: 'text', label: 'Brand Name Text Only', desc: 'Bold serif AZEEZ JEWELS' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLeftBrandStyle(opt.id as any)}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                      leftBrandStyle === opt.id
                        ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-sm ring-1 ring-gold-500'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span>{opt.label}</span>
                      {leftBrandStyle === opt.id && <Check size={12} className="text-gold-600" />}
                    </div>
                    <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span><strong>No Brand on Tag:</strong> Left flap shows product details only, and Right flap has the big barcode.</span>
              </span>
            </div>
          )}

          {/* CONTROLS: TAIL POSITION & FLIP 180 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Sticker Tail Position on Roll
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'right', label: 'Head on Left / Tail on Right (Your Printer)' },
                  { id: 'left', label: 'Tail on Left / Head on Right' }
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

          {/* BARCODE ENCODING MODE & SYMBOLOGY */}
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

          {/* FONT & CLARITY SETTINGS (ANTI-BLOBBING CONTROLS) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Type size={15} className="text-gold-600" />
                Font Style & Print Sharpness (Anti-Blobbing)
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Zero Stroke • Open Counters
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* FONT PRESET */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Font Family
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'verdana', label: 'Verdana (Recommended)', desc: 'Large open loops in e, g, 9, 6, 8, 0 (stops ink fill-in)' },
                    { id: 'consolas', label: 'Consolas (Clean Mono)', desc: 'Uniform width, distinct open zeros and digits' },
                    { id: 'segoe', label: 'Segoe UI', desc: 'Modern crisp Windows sans-serif' },
                    { id: 'arial', label: 'Arial Clean', desc: 'Standard sans-serif without heavy stroke' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFontPreset(opt.id as any)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                        fontPreset === opt.id
                          ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm ring-1 ring-gold-500'
                          : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {fontPreset === opt.id && <Check size={12} className="text-gold-600" />}
                      </div>
                      <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONT WEIGHT & CASE */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Print Thickness (Weight)
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: '700', label: 'Bold 700 (Recommended)', desc: 'Dark solid black with open interior loops' },
                      { id: '600', label: 'Semi-Bold 600 (Extra Sharp)', desc: 'Thinner strokes if hot ribbon causes dot spread' },
                      { id: '800', label: 'Extra Bold 800', desc: 'For lighter ribbons or low darkness' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFontWeight(opt.id as any)}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                          fontWeight === opt.id
                            ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm ring-1 ring-gold-500'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          {fontWeight === opt.id && <Check size={12} className="text-gold-600" />}
                        </div>
                        <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Item Name Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'uppercase', label: 'RING (All Caps)', desc: 'No descenders' },
                      { id: 'capitalize', label: 'Ring (Title Case)', desc: 'Mixed case' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTextCase(opt.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-left ${
                          textCase === opt.id
                            ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm ring-1 ring-gold-500'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt.label}</span>
                          {textCase === opt.id && <Check size={12} className="text-gold-600" />}
                        </div>
                        <p className="text-[9px] font-normal text-gray-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Net & Gross Weight Size
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'normal', label: '1.55mm' },
                      { id: 'large', label: '1.75mm (Large)' },
                      { id: 'xlarge', label: '1.95mm (Max)' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setWeightFontSize(opt.id as any)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          weightFontSize === opt.id
                            ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-sm ring-1 ring-gold-500'
                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="truncate">{opt.label}</span>
                          {weightFontSize === opt.id && <Check size={11} className="text-gold-600 shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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
                <strong>Darkness:</strong> Keep Darkness around <strong>8 - 10</strong> in Printer Preferences. If letters start filling in, drop by 1 level.
              </li>
              <li>
                <strong>Print Speed:</strong> Lower Print Speed to <strong>2.0 in/sec (50 mm/sec)</strong> in the <i>Options</i> tab for deep, solid black ink melt without smear.
              </li>
              <li>
                <strong>Dithering:</strong> Keep set to <strong>None</strong> in the <i>Graphics</i> tab.
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
