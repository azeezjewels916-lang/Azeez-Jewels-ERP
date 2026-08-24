# 💎 Azeez Jewels ERP

A specialized, full-featured retail **Point-of-Sale (POS)** and **Enterprise Resource Planning (ERP)** software designed specifically for **Azeez Jewels** (#324, Jumma Masjid Road, OPH Road, Shivajinagar, Bangalore - 560051). 

It handles gold/silver trade dynamics, daily multi-purity metal pricing, BIS HUID hallmarking, making charges, old gold scrap exchange/buying, GST taxation, layaway installment plans, advance order bookings, automated stock restoration, thermal barcode tag printing, and print-ready A5 tax invoice generation—wrapped in a luxury minimalist champagne gold aesthetic.

---

## 🏬 Showroom Details

- **Store Name**: Azeez Jewels
- **Proprietor**: Azmathulla Khan
- **Contact**: +91 9916667573
- **Tagline**: Dealers in 22 Ct. 916 KDM Gold & Silver Ornaments
- **Address**: #324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051
- **GSTIN Numbers**: `29BBGPM2303C1Z4` / `29BPSPK1616Q1Z2`
- **Domain**: `azeezjewels.com`

---

## 🌟 Key Features

### 🛍️ Sales Bill (POS Invoicing Engine)
- **Automatic Reference Generation**: Collision-free bill sequence numbers (`MJ-0001`, `MJ-0002`...).
- **Multi-Metal Dynamic Pricing**: Live daily market rates for Gold 24K, 22K (916), 18K (750), Silver 925, Silver 70, and Selam Silver.
- **Precision Weight & Charges**: Gross Weight vs. Net Weight calculation, making charges (flat ₹ amount or % percentage).
- **Taxation Engine**: 3% GST split into CGST (1.5%) and SGST (1.5%), or Non-GST billing mode.
- **Old Gold Deduction**: Subtract scrap gold/silver value directly from subtotal.
- **Silver Cash Bill**: Dedicated silver billing engine with `GSTIN: 29BPSPK1616Q1Z2`, auto **40% Exchange Value** & **50% Return Value** calculation.
- **Multi-Payment Split**: Cash, Card, UPI, Cheque, Bank Transfer.
- **High-Definition A5 Print Invoices**: Clean rendering using `/logowithoutbg.png` with official guarantee terms & conditions.

### 📊 Sales History & Analytics
- **Dashboard KPIs**: Real-time revenue metrics, total bills generated, and average bill value.
- **Filtering & Search**: Search by Bill Number, Customer Name/Phone; filter by Date Range or Tax Type.
- **Full Sales Operations**: View, Edit bill (re-populates POS), Delete bill (with automated stock restoration), and Re-print invoice.

### 📦 Inventory Management & TSC Barcode Printing
- **BIS HUID & Barcode Tracking**: SKU scanning and Hallmark Unique Identification.
- **TSC TTP-244 Pro Barcode Generator**: Built-in thermal tag generator supporting `81x12mm`, `100x15mm`, and `100x20mm` tail tags.
- **16 Standard Jewellery Categories**: Ring, Bangle, Chain, Haar, Laccha, Choker, Japka, Mangtila, Motol, Necklace, Tops, Bracelet, Kada, Baali, Earring, Pendent.
- **Stock Restoration Engine**: Upon bill deletion, sold items are automatically restored to stock inventory (`quantity + 1` or re-creating deleted items).
- **Excel / CSV Export**: Instant 1-click Excel export across Inventory, Sales History, Order Bookings, Customers, and Layaway modules.

### 🔄 Gold Exchange / Scrap Purchasing
- **Scrap Purchasing**: Buy old gold and silver directly from walk-in clients.
- **Vouchers**: Generates reference vouchers (`MJ-EX...`) with HSN code tagging and printable receipts.

### ⏳ Layaway / Installment Schemes
- **Savings Ledger**: Manage installment purchase schemes for high-value jewellery.
- **Ledger Tracking**: Active vs. Closed schemes, payment history, and printable A5 statements.

### 📅 Order Advance Booking
- **Bespoke Manufacturing**: Custom order booking system supporting Making Charges in **₹ (Amount)** or **% (Percentage)**.
- **Financial Breakdown**: Tracks Subtotal, GST 3% / Non-GST, Old Gold deduction, Advance Paid, and Remaining Balance Due on screen and A5 print receipts.

### 👥 Customer Relationship Management (CRM)
- **Client Directory**: Customer master profiles with instant phone search, auto-fill, and inline creation.
- **Customer History View**: Consolidated transaction history across all sales, layaways, and advance bookings per customer.

### 🔐 Streamlined Authentication & Role Access
- **Single-Button Login**: One clean **`SIGN IN TO SYSTEM`** button.
  - **Admin Login**: Entering Admin credentials (`admin` / `admin123` or DB Admin) unlocks **Full ERP Access**.
  - **Staff POS Mode**: Submitting without credentials automatically opens **Staff Sales Bill POS Mode**.
- **Role Access Control**: Staff access is strictly restricted to **Sales Bill (`sales-bill`) ONLY** as requested by store management. Admin users maintain full access to all modules, inventory, and hidden GST controls.

---

## 🛠️ Architecture & Setup

### 📁 Independent Directory Structure
```
azeez-jewels/
├── erp/                       # Full ERP Application (Port 5173)
│   ├── App.tsx
│   ├── pages/                 # SalesBill, AllSales, AdvanceBooking, Customers, Inventory...
│   ├── components/            # UIComponents, InvoicePrint, SilverBillPrint, BarcodePrintModal...
│   └── package.json
└── website/                   # Standalone Brand Website (Port 5174)
    ├── App.tsx
    ├── components/            # Navbar, Hero, Collections, AboutSection, ContactSection
    └── package.json
```

### 🚀 Running the Applications

#### **1. Azeez Jewels ERP Application (Port 5173)**
```bash
cd erp
npm run dev
```
➜ Open **[http://localhost:5173](http://localhost:5173)** in your browser.

#### **2. Standalone Brand Website (Port 5174)**
```bash
cd website
npm run dev
```
➜ Open **[http://localhost:5174](http://localhost:5174)** in your browser.

---

## 🎨 Luxury Minimalist Palette

- **Background**: Soft Warm Off-White / Alabaster (`#FAF8F5`)
- **Cards & Surfaces**: Clean White (`#FFFFFF`) & Warm Sand Beige (`#F5F2EC`)
- **Accents**: Refined Champagne Gold (`#C5A059`) & Antique Bronze Gold (`#A3803C`)
- **Obsidian Dark Mode**: Deep Warm Charcoal (`#1C1917`) & (`#12100E`)
- **Typography**: Cormorant Garamond, Playfair Display, Outfit, Inter, and JetBrains Mono

---

## 📄 License

Private & Proprietary — **Azeez Jewels**.
