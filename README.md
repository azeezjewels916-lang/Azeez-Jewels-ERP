# Azeez Jewels ERP

A specialized, full-featured retail **Point-of-Sale (POS)** and **Enterprise Resource Planning (ERP)** software designed specifically for **Azeez Jewels** (#324, Jumma Masjid Road, OPH Road, Shivajinagar, Bangalore - 560051). 

It handles gold/silver trade dynamics, daily multi-purity metal pricing, BIS HUID hallmarking, making charges, old gold scrap exchange/buying, GST taxation, layaway installment plans, advance order bookings, automated stock restoration, and print-ready A5 tax invoice generation—wrapped in a luxury minimalist beige and off-white aesthetic.

---

## 🏬 Showroom Details

- **Store Name**: Azeez Jewels
- **Proprietor**: Azmathulla Khan
- **Contact**: +91 9916667573
- **Specialization**: Dealers in 22 Ct. 916 KDM Gold & Silver Ornaments
- **Address**: #324, Jumma Masjid Road (OPH Road), Shivajinagar, Bangalore - 560051

---

## 🌟 Key Features

### 🛍️ Sales Bill (POS Invoicing Engine)
- **Automatic Reference Generation**: Collision-free bill sequence numbers (`MJ-0001`, `MJ-0002`...).
- **Multi-Metal Dynamic Pricing**: Live daily market rates for Gold 24K, 22K (916), 18K (750), Silver 925, Silver 70, and Selam Silver.
- **Precision Weight & Charges**: Gross Weight vs. Net Weight calculation, making charges (flat amount or percentage).
- **Taxation Engine**: 3% GST split into CGST (1.5%) and SGST (1.5%), or Non-GST billing mode.
- **Old Gold Deduction**: Subtract scrap gold/silver value directly from subtotal.
- **Multi-Payment Split**: Cash, Card, UPI, Cheque, Bank Transfer.
- **A5 Printable Invoices**: Instant modal preview and print rendering with official Azeez Jewels header.

### 📊 Sales History & Analytics
- **Dashboard KPIs**: Real-time revenue metrics, total bills generated, and average bill value.
- **Filtering & Search**: Search by Bill Number, Customer Name/Phone; filter by Date Range or Tax Type.
- **Full Sales Operations**: View, Edit bill (re-populates POS), Delete bill (with automated stock restoration), and Re-print invoice.

### 📦 Inventory & Hallmarking
- **BIS HUID & Barcode Tracking**: SKU scanning and Hallmark Unique Identification.
- **16 Standard Jewellery Categories**: Ring, Bangle, Chain, Haar, Laccha, Choker, Japka, Mangtila, Motol, Necklace, Tops, Bracelet, Kada, Baali, Earring, Pendent.
- **3-Tier Match & Delete Engine**:
  1. *Priority 1*: Exact inventory database primary key (`inventory_item_id`).
  2. *Priority 2*: Barcode + Category + Weight match.
  3. *Priority 3*: Barcode fallback.
- **Stock Restoration Engine**: Upon bill deletion, sold items are automatically restored to stock inventory (`quantity + 1` or re-creating deleted items).
- **Single Total Weight Standard**: Unified weight tracking using Total Weight (g) across item forms, stock tables, breakdown metrics, and printable receipts.
- **Excel / CSV Export**: Instant 1-click Excel export across Inventory, Sales History, Order Bookings, Customers, and Layaway modules.

### 🔄 Gold Exchange / Buying
- **Scrap Purchasing**: Buy old gold and silver directly from walk-in clients.
- **Vouchers**: Generates reference vouchers (`MJ-EX...`) with HSN code tagging and printable receipts.

### ⏳ Layaway / Installment Schemes
- **Savings Ledger**: Manage installment purchase schemes for high-value jewellery.
- **Ledger Tracking**: Active vs. Closed schemes, payment history, and printable A5 statements.

### 📅 Order Advance Booking
- **Bespoke Manufacturing**: Custom order booking system with optional metal price locking.
- **Financial Breakdown**: Tracks Advance Paid vs. Remaining Balance Due.

### 👥 Customer Relationship Management (CRM)
- **Client Directory**: Customer master profiles with phone, email, address, and notes.
- **Customer History View**: Consolidated transaction history across all sales, layaways, and advance bookings per customer.

### 🔐 User Management & Access Control
- **Role-Based Access Control (RBAC)**: Admin vs. Staff mode.
- **Staff Access (5 Modules Enabled)**: Sales Bill (`sales-bill`), All Sales / Sales History (`all-sales`), Layaway (`layaway`), Order Booking (`advance`), and Customers / CRM (`customers`).
- **Restricted for Staff**: Inventory Management (`inventory`) and User Management / Admin Settings (`users`) remain restricted to Admin role only.

---

## 🎨 Luxury Minimalist Theme

- **Background**: Soft Warm Off-White / Alabaster (`#FAF8F5`)
- **Cards & Surfaces**: Clean White (`#FFFFFF`) & Warm Sand Beige (`#F5F2EC`)
- **Accents**: Refined Champagne Gold (`#C5A059`) & Antique Bronze Gold (`#A3803C`)
- **Borders**: Subtle Linen Neutral (`#E8E3D9`)
- **Typography**: Playfair Display, Cormorant Garamond, Inter, and JetBrains Mono

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS
- **Icons**: Lucide React
- **Database & Backend**: Supabase (`@supabase/supabase-js`)
- **Print Engine**: Custom `@media print` CSS for A5 size formatting

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd azeez-jewels
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   > 💡 **Access URL**: Open **[http://localhost:5173](http://localhost:5173)** in your browser. (Port `5173` avoids conflicts with other Node/Next.js apps running on port `3000`).

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 📄 License

Private & Proprietary — **Azeez Jewels**.
