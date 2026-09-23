-- ==============================================================================
-- AZEEZ JEWELS ERP - DATABASE RESET / CLEAR TRANSACTION & DUMMY DATA SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vdhnjmeyvbcbvdreltcb/sql/new
--
-- This script:
-- 1. Adds any missing columns (purity, old_silver_amount, discount).
-- 2. Clears all test transactions (Bills, Bill Items, Exchanges, Bookings, Layaways).
-- 3. Clears dummy/test customers and resets customer sequence back to 1.
-- 4. Preserves your inventory items, daily rates, and staff user logins.
-- ==============================================================================

-- 1. Ensure any missing columns exist in PostgreSQL schema
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS purity TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS old_silver_amount NUMERIC DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;

-- 2. Clear all transaction data (Foreign keys cascade safely)
TRUNCATE TABLE 
    layaway_transactions,
    advance_bookings,
    bill_items,
    bills,
    gold_exchanges
RESTART IDENTITY CASCADE;

-- 3. Clear dummy customer records
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- 4. Reset all auto-increment ID sequences back to 1
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bills_id_seq') THEN
        ALTER SEQUENCE bills_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bill_items_id_seq') THEN
        ALTER SEQUENCE bill_items_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'gold_exchanges_id_seq') THEN
        ALTER SEQUENCE gold_exchanges_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'advance_bookings_id_seq') THEN
        ALTER SEQUENCE advance_bookings_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'layaway_transactions_id_seq') THEN
        ALTER SEQUENCE layaway_transactions_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'customers_id_seq') THEN
        ALTER SEQUENCE customers_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ==============================================================================
-- OPTIONAL: IF YOU ALSO WANT TO WIPE INVENTORY TO START 100% BLANK:
-- (Uncomment the line below only if you want to delete all inventory items too)
--
-- TRUNCATE TABLE items RESTART IDENTITY CASCADE;
-- ==============================================================================
