# Maison Joaillerie ERP (Mayakka Jewellers)

A specialized, full-featured retail **Point-of-Sale (POS)** and **Enterprise Resource Planning (ERP)** software designed specifically for jewellery businesses. It handles gold/silver trade dynamics, daily metal pricing, multi-purity valuation, BIS HUID hallmarking, making charges, old gold scrap exchange/buying, GST taxation, layaway installment plans, advance order bookings, and A5 tax invoice generation.

---

## 🌟 Key Features

### 🛍️ Sales Bill (POS Invoicing Engine)
- **Automatic Reference Generation**: Collision-free bill sequence numbers (`MJ-0001`, `MJ-0002`...).
- **Multi-Metal Dynamic Pricing**: Live daily market rates for Gold 24K, 22K (916), 18K (750), Silver 925, Silver 70, and Selam Silver.
- **Precision Weight & Charges**: Gross Weight vs. Net Weight calculation, making charges (flat amount or percentage).
- **Taxation Engine**: 3% GST split into CGST (1.5%) and SGST (1.5%), or Non-GST billing mode.
- **Old Gold Deduction**: Subtract scrap gold/silver value directly from subtotal.
- **Multi-Payment Split**: Cash, Card, UPI, Cheque, Bank Transfer.
- **A5 Printable Invoices**: Instant modal preview and print rendering.

### 📊 Sales History & Analytics
- **Dashboard KPIs**: Real-time revenue metrics, total bills generated, and average bill value.
- **Filtering & Search**: Search by Bill Number, Customer Name/Phone; filter by Date Range or Tax Type.
- **Full Sales Operations**: View, Edit bill (re-populates POS), Delete bill (with cascade cleanup), and Re-print invoice.

### 📦 Inventory & Hallmarking
- **BIS HUID & Barcode Tracking**: SKU scanning and Hallmark Unique Identification.
- **Comprehensive Categories**: 
  1. Ring
  2. Chain
  3. Haar
  4. Laccha
  5. Choker
  6. Japka
  7. Mangtila
  8. Motol
  9. Necklace
  10. Tops
  11. Bracelet
  12. Kada
  13. Baali
  14. Earring
  15. Pendent
- **Live Category Metrics**: Check item count, piece quantity, and total weight (g) per category (e.g. Ring, Chain, Haar, etc.) with a single click or category filter.
- **Single Total Weight Standard**: Unified weight tracking using Total Weight (g) across item forms, stock tables, breakdown metrics, and printable receipts.
- **Purity Options**: 24K, 22K, 18K, 14K, Silver (925), Silver (70), Selam.
- **Keyboard Shortcuts**: `Alt + N` (New Item), `Alt + B` (Focus Barcode), `Ctrl + S` (Save), `Esc` (Close).

### 🔄 Gold Exchange / Buying
- **Scrap Purchasing**: Buy old gold and silver directly from walk-in clients.
- **Vouchers**: Generates reference vouchers (`MJ-EX...`) with HSN code tagging and printable purchase receipts.

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
- **Role-Based Access Control (RBAC)**: Admin, Staff, and Read-Only roles.
- **Permissions**: Feature toggles for editing bills, stock management, and non-GST authorization.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS
- **Icons**: Lucide React
- **Database & Backend**: Supabase (PostgreSQL)
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
   cd jewellery_ERP-main
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

Private & Proprietary - **Maison Joaillerie / Mayakka Jewellers**.
