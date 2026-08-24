import { supabase } from './supabaseClient';

// --- BILLS ---

export const generateBillNo = async () => {
  // Scan bills and exchanges with deeper limit to find the absolute maximum sequence number
  const [{ data: bills }, { data: exchanges }] = await Promise.all([
    supabase.from('bills').select('bill_no').order('id', { ascending: false }).limit(200),
    supabase.from('gold_exchanges').select('reference_no').order('id', { ascending: false }).limit(200)
  ]);

  let maxNum = 0;

  const extractNumber = (str: string) => {
    if (!str) return;
    const match = str.match(/MJ-(\d+)/i) || str.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum && num < 1000000) maxNum = num;
    }
  };

  bills?.forEach(b => extractNumber(b.bill_no));
  exchanges?.forEach(e => extractNumber(e.reference_no));

  const nextNum = maxNum + 1;
  const padded = nextNum.toString().padStart(Math.max(4, nextNum.toString().length), '0');
  return `MJ-${padded}`;
};

export const restoreInventoryStock = async (billItems: any[]) => {
  if (!billItems || billItems.length === 0) return;

  for (const item of billItems) {
    if (!item.barcode && !item.inventory_item_id) continue;
    if (item.item_name === 'Value Added / MC') continue; // Skip fee lines

    let existingItem: any = null;

    // 1. Priority 1: Match by exact inventory primary key ID
    if (item.inventory_item_id) {
      const targetId = (typeof item.inventory_item_id === 'string' && !isNaN(Number(item.inventory_item_id)))
        ? Number(item.inventory_item_id)
        : item.inventory_item_id;

      const { data: byId } = await supabase
        .from('items')
        .select('*')
        .eq('id', targetId)
        .limit(1);

      if (byId && byId.length > 0) {
        existingItem = byId[0];
      }
    }

    // 2. Priority 2: Match by barcode + category/weight for duplicate barcodes
    if (!existingItem && item.barcode) {
      const { data: byBarcode } = await supabase
        .from('items')
        .select('*')
        .eq('barcode', item.barcode)
        .order('created_at', { ascending: false });

      if (byBarcode && byBarcode.length > 0) {
        existingItem = byBarcode.find(i => {
          const matchCat = item.category && i.category && i.category.toLowerCase().trim() === item.category.toLowerCase().trim();
          const matchWt = (item.net_weight || item.weight) &&
            (Math.abs((i.net_weight || i.weight || 0) - (item.net_weight || item.weight || 0)) < 0.005);
          return matchCat || matchWt;
        }) || byBarcode[0];
      }
    }

    if (existingItem) {
      // If Item Exists in Inventory: Increments its quantity (quantity + 1) and sets status to in_stock
      const currentQty = existingItem.quantity !== undefined && existingItem.quantity !== null ? Number(existingItem.quantity) : 1;
      await supabase
        .from('items')
        .update({
          quantity: currentQty + 1,
          stock_status: 'in_stock'
        })
        .eq('id', existingItem.id);
    } else {
      // If Item Was Deleted Upon Sale: Automatically re-creates the item record back into items inventory table!
      const itemToCreate = {
        barcode: item.barcode || 'RESTORED-' + Math.floor(100000 + Math.random() * 900000),
        item_name: item.item_name || 'Restored Jewellery Item',
        category: item.category || 'General',
        gross_weight: item.gross_weight || item.weight || 0,
        net_weight: item.net_weight || item.weight || 0,
        weight: item.weight || item.net_weight || 0,
        purity: item.purity || '916',
        metal_type: item.metal_type || 'gold',
        making_charges: item.making_charges || 0,
        hsn_code: item.hsn_code || '711319',
        huid: item.huid || null,
        quantity: 1,
        stock_status: 'in_stock',
        price_per_gram: item.rate || 0
      };

      await supabase
        .from('items')
        .insert([itemToCreate]);
    }
  }
};

export const deleteBill = async (id: number) => {
  // 1. Fetch all items associated with this bill before deleting
  const { data: billItems } = await supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', id);

  // 2. Restore stock back into items inventory
  if (billItems && billItems.length > 0) {
    try {
      await restoreInventoryStock(billItems);
    } catch (restoreErr) {
      console.error('Error restoring inventory stock on bill deletion:', restoreErr);
    }
  }

  // 3. Delete bill_items and bill records
  const { error: itemsError } = await supabase
    .from('bill_items')
    .delete()
    .eq('bill_id', id);

  if (itemsError) throw itemsError;

  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getCustomerHistory = async (customerId: number) => {
  const { data, error } = await supabase
    .from('bills')
    .select('*, bill_items(*)')
    .eq('customer_id', customerId)
    .order('bill_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCustomerBookings = async (customerId: number) => {
  const { data, error } = await supabase
    .from('advance_bookings')
    .select('*, bills(*)')
    .eq('bills.customer_id', customerId)
    .order('booking_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCustomerLayaways = async (customerId: number) => {
  const { data, error } = await supabase
    .from('layaway_transactions')
    .select('*, bills(*)')
    .eq('bills.customer_id', customerId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createBill = async (billData: any) => {
  let attempts = 0;
  let currentBillData = { ...billData };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('bills')
      .insert(currentBillData)
      .select()
      .single();

    if (!error) return data;

    // Detect duplicate key constraint violation on bill_no (code 23505)
    if (error.code === '23505' || error.message?.includes('bills_bill_no_key') || error.message?.includes('unique constraint')) {
      attempts++;
      const freshNo = await generateBillNo();
      // If generateBillNo returns the same number, force next sequential increment
      const match = freshNo.match(/MJ-(\d+)/i);
      const baseSeq = match ? parseInt(match[1], 10) : 1;
      const forcedSeq = baseSeq + (attempts - 1);
      const forcedNo = `MJ-${forcedSeq.toString().padStart(4, '0')}`;
      currentBillData.bill_no = forcedNo;
    } else {
      throw error;
    }
  }

  throw new Error('Failed to save bill after multiple unique bill number retries.');
};

export const updateBill = async (id: number, billData: any) => {
  const { data, error } = await supabase
    .from('bills')
    .update(billData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getBillById = async (id: number) => {
  const { data, error } = await supabase
    .from('bills')
    .select('*, customers(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// --- BILL ITEMS ---

export const createBillItems = async (billId: number, items: any[]) => {
  const itemsWithBillId = items.map(item => ({ ...item, bill_id: billId }));

  const { data, error } = await supabase
    .from('bill_items')
    .insert(itemsWithBillId)
    .select();

  if (error) throw error;
  return data;
};

export const getBillItems = async (billId: number) => {
  const { data, error } = await supabase
    .from('bill_items')
    .select('*')
    .eq('bill_id', billId)
    .order('sl_no', { ascending: true });

  if (error) throw error;
  return data;
};

// --- CUSTOMERS ---

export const searchCustomers = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    .limit(10);

  if (error) throw error;
  return data;
};

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createCustomer = async (customerData: any) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: number, customerData: any) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: number) => {
  // First disassociate any bills linked to this customer (set customer_id = null)
  // to avoid foreign key constraint violations (bills_customer_id_fkey) while keeping sales history
  const { error: unlinkError } = await supabase
    .from('bills')
    .update({ customer_id: null })
    .eq('customer_id', id);

  if (unlinkError) {
    console.error('Error unlinking bills for customer:', unlinkError);
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- ITEMS (INVENTORY) ---

export const getInventoryItems = async () => {
  let allItems: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // Loop page-by-page to bypass Supabase PostgREST 1,000 max_rows per-request limit
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      allItems = [...allItems, ...data];
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allItems;
};

export const createInventoryItem = async (itemData: any) => {
  const { id: _id, created_at: _created_at, ...cleanData } = itemData;

  const { data, error } = await supabase
    .from('items')
    .insert(cleanData)
    .select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const updateInventoryItem = async (id: string | number, itemData: any) => {
  const { id: _id, created_at: _created_at, ...cleanData } = itemData;
  const targetId = (typeof id === 'string' && !isNaN(Number(id))) ? Number(id) : id;

  const { data, error } = await supabase
    .from('items')
    .update(cleanData)
    .eq('id', targetId)
    .select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const deleteInventoryItem = async (id: string | number) => {
  const targetId = (typeof id === 'string' && !isNaN(Number(id))) ? Number(id) : id;

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', targetId);

  if (error) throw error;
};

export const getItemByBarcode = async (barcode: string) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('barcode', barcode)
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
};

export const deductInventoryStock = async (billItems: any[]) => {
  for (const billItem of billItems) {
    if (!billItem.barcode && !billItem.inventory_item_id) continue;
    if (billItem.item_name === 'Value Added / MC') continue;

    let targetItem: any = null;

    // 1. Priority 1 (Exact Match): Match by unique database inventory_item_id
    if (billItem.inventory_item_id) {
      const targetId = (typeof billItem.inventory_item_id === 'string' && !isNaN(Number(billItem.inventory_item_id)))
        ? Number(billItem.inventory_item_id)
        : billItem.inventory_item_id;

      const { data: byId } = await supabase
        .from('items')
        .select('*')
        .eq('id', targetId)
        .limit(1);

      if (byId && byId.length > 0) {
        targetItem = byId[0];
      }
    }

    // 2. Priority 2 (Category & Weight Match): Match by barcode + category + weight
    if (!targetItem && billItem.barcode) {
      const { data: matchedItems } = await supabase
        .from('items')
        .select('*')
        .eq('barcode', billItem.barcode)
        .order('created_at', { ascending: false });

      if (matchedItems && matchedItems.length > 0) {
        // Strict Category + Weight Match
        targetItem = matchedItems.find(i => {
          const matchCategory = billItem.category && i.category && i.category.toLowerCase().trim() === billItem.category.toLowerCase().trim();
          const itemWt = i.net_weight || i.weight || 0;
          const billWt = billItem.net_weight || billItem.weight || 0;
          const matchWeight = billWt > 0 && Math.abs(itemWt - billWt) < 0.005;
          return matchCategory && matchWeight;
        })
          // Category Match
          || matchedItems.find(i => billItem.category && i.category && i.category.toLowerCase().trim() === billItem.category.toLowerCase().trim())
          // Priority 3 (Fallback): Barcode fallback
          || matchedItems[0];
      }
    }

    if (!targetItem) continue;

    const soldQty = 1;
    const currentQty = targetItem.quantity !== undefined && targetItem.quantity !== null ? Number(targetItem.quantity) : 1;
    const newQty = Math.max(0, currentQty - soldQty);

    if (newQty <= 0) {
      // Delete sold product from inventory table after sale
      await supabase
        .from('items')
        .delete()
        .eq('id', targetItem.id);
    } else {
      // Reduce quantity if item had multiple pcs stored
      await supabase
        .from('items')
        .update({
          quantity: newQty,
          stock_status: 'in_stock'
        })
        .eq('id', targetItem.id);
    }
  }
};

// --- GOLD RATES ---

export const getDailyRates = async (date: string) => {
  const { data, error } = await supabase
    .from('gold_rates')
    .select('*')
    .eq('effective_date', date);

  if (error) throw error;
  return data;
};

// --- LAYAWAY TRANSACTIONS ---

export const getLayawayTransactions = async (billId?: number) => {
  let query = supabase
    .from('layaway_transactions')
    .select('*')
    .order('payment_date', { ascending: false });

  if (billId) {
    query = query.eq('bill_id', billId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
};

export const getLayawayTransactionById = async (id: number) => {
  const { data, error } = await supabase
    .from('layaway_transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createLayawayTransaction = async (transaction: any) => {
  const { data, error } = await supabase
    .from('layaway_transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLayawayTransaction = async (id: number, updates: any) => {
  const { data, error } = await supabase
    .from('layaway_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLayawayTransaction = async (id: number) => {
  const { error } = await supabase
    .from('layaway_transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- ADVANCE BOOKINGS ---

export const getAdvanceBookings = async () => {
  const { data, error } = await supabase
    .from('advance_bookings')
    .select(`
      *,
      bills (
        *,
        customers (*)
      )
    `)
    .order('booking_date', { ascending: false });

  if (error) throw error;
  return data as any[];
};

export const getAdvanceBookingById = async (id: number) => {
  const { data, error } = await supabase
    .from('advance_bookings')
    .select(`
      *,
      bills (
        *,
        customers (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createAdvanceBooking = async (booking: any) => {
  const { data, error } = await supabase
    .from('advance_bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAdvanceBooking = async (id: number, updates: any) => {
  const { data, error } = await supabase
    .from('advance_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAdvanceBooking = async (id: number) => {
  const { error } = await supabase
    .from('advance_bookings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- GOLD EXCHANGES ---

export const getExchanges = async () => {
  const { data, error } = await supabase
    .from('gold_exchanges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createExchange = async (exchangeData: any) => {
  const { data, error } = await supabase
    .from('gold_exchanges')
    .insert(exchangeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExchange = async (id: string, exchangeData: any) => {
  const { data, error } = await supabase
    .from('gold_exchanges')
    .update(exchangeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExchange = async (id: string) => {
  const { error } = await supabase
    .from('gold_exchanges')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
