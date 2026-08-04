import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const BranchDetailPage = () => {
  const {
    activeBranch,
    db,
    currentUser,
    setActivePage,
    getBranchStockStatus,
    addDeliveryRecord,
    editDeliveryRecord,
    deleteDeliveryRecord,
    currentCart,
    addToCart,
    removeFromCart,
    checkoutSale,
    requestConfirm
  } = useApp();

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [editingDeliveryId, setEditingDeliveryId] = useState(null);
  
  const [deliveryData, setDeliveryData] = useState({
    date: '',
    supplier: '',
    invNo: '',
    item: '',
    qty: '',
    expiry: '',
    cost: '',
    retailPrice: ''
  });

  const [selectedPosItem, setSelectedPosItem] = useState('');
  const [posQty, setPosQty] = useState(1);

  const stockStatus = getBranchStockStatus(activeBranch);

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    if (!deliveryData.item || !deliveryData.qty || !deliveryData.retailPrice) {
      alert("Please ensure Item, Quantity, Unit Cost, and Retail Price are filled.");
      return;
    }

    if (editingDeliveryId) {
      editDeliveryRecord(editingDeliveryId, deliveryData);
    } else {
      addDeliveryRecord(activeBranch, deliveryData);
    }
    
    // Reset Form
    setDeliveryData({ date: '', supplier: '', invNo: '', item: '', qty: '', expiry: '', cost: '', retailPrice: '' });
    setEditingDeliveryId(null);
    setShowDeliveryForm(false);
  };

  const startEditDelivery = (inv) => {
    // Populate form with existing data
    setDeliveryData({
      date: inv.date || '',
      supplier: inv.supplier || '',
      invNo: inv.invNo || '',
      item: inv.item || '',
      qty: inv.qty || '',
      expiry: inv.expiry || '',
      cost: inv.cost || '',
      retailPrice: inv.retailPrice ? inv.retailPrice : (inv.cost * 1.3).toFixed(2)
    });
    setEditingDeliveryId(inv.id);
    setShowDeliveryForm(true);
  };

  const cancelEdit = () => {
    setEditingDeliveryId(null);
    setDeliveryData({ date: '', supplier: '', invNo: '', item: '', qty: '', expiry: '', cost: '', retailPrice: '' });
    setShowDeliveryForm(false);
  };

  const handleAddToCart = () => {
    if (!selectedPosItem) return alert("Select an item.");
    const details = stockStatus[selectedPosItem];
    if (!details) return;

    const res = addToCart(selectedPosItem, details.retailPrice, Number(posQty), details.available);
    if (!res.success) alert(res.message);
    else {
      setSelectedPosItem('');
      setPosQty(1);
    }
  };

  const handleCheckout = () => {
    checkoutSale();
  };

  const branchInvoices = db.invoices[activeBranch] || [];
  const branchStaff = db.users.filter(u => u.branch === activeBranch);
  const grandTotalCart = currentCart.reduce((sum, c) => sum + c.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{activeBranch} Location</h2>
        {currentUser?.sysRole === 'admin' && (
          <button
            onClick={() => setActivePage('businessPage')}
            className="px-4 py-2 bg-gray-400 text-white text-xs font-semibold rounded hover:bg-gray-500"
          >
            ← Back to All Branches
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Main Deliveries Section */}
        <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-secondary text-sm">Inventory Deliveries</h4>
            <button
              onClick={() => {
                cancelEdit();
                setShowDeliveryForm(!showDeliveryForm);
              }}
              className="px-3 py-1.5 bg-success text-white text-xs font-semibold rounded hover:bg-green-600"
            >
              + Add Delivery
            </button>
          </div>

          {showDeliveryForm && (
            <form onSubmit={handleDeliverySubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3 shadow-inner">
              <h5 className="font-bold text-sm text-gray-700 mb-2 border-b pb-1">
                {editingDeliveryId ? "✏️ Edit Delivery Record" : "📦 New Delivery"}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input type="date" value={deliveryData.date} onChange={e => setDeliveryData({ ...deliveryData, date: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Supplier</label>
                  <input type="text" value={deliveryData.supplier} onChange={e => setDeliveryData({ ...deliveryData, supplier: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Invoice #</label>
                  <input type="text" value={deliveryData.invNo} onChange={e => setDeliveryData({ ...deliveryData, invNo: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Item Name</label>
                  <input type="text" value={deliveryData.item} onChange={e => setDeliveryData({ ...deliveryData, item: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Qty Delivered</label>
                  <input type="number" value={deliveryData.qty} onChange={e => setDeliveryData({ ...deliveryData, qty: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Expiry Date</label>
                  <input type="date" value={deliveryData.expiry} onChange={e => setDeliveryData({ ...deliveryData, expiry: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Cost ($)</label>
                  <input type="number" step="0.01" value={deliveryData.cost} onChange={e => setDeliveryData({ ...deliveryData, cost: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-accent">Retail Price ($)</label>
                  <input type="number" step="0.01" value={deliveryData.retailPrice} onChange={e => setDeliveryData({ ...deliveryData, retailPrice: e.target.value })} className="w-full p-2 border border-accent rounded" placeholder="POS Price" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-accent text-white text-xs font-bold rounded hover:bg-teal-600">
                  {editingDeliveryId ? "Update Delivery Record" : "Save Delivery Record"}
                </button>
                {editingDeliveryId && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-400 text-white text-xs font-bold rounded hover:bg-gray-500">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                <th className="p-2">NO</th>
                <th className="p-2">DATE</th>
                <th className="p-2">INV #</th>
                <th className="p-2">ITEM</th>
                <th className="p-2">QTY</th>
                <th className="p-2">STOCK LEFT</th>
                <th className="p-2">EXPIRY</th>
                <th className="p-2">UNIT COST</th>
                <th className="p-2 text-accent">RETAIL PRICE</th>
                {currentUser?.sysRole === 'admin' && <th className="p-2 text-center">ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {branchInvoices.map((inv, idx) => {
                const stockLeft = stockStatus[inv.item] ? stockStatus[inv.item].available : 0;
                const isExpired = new Date(inv.expiry) < new Date();
                const displayRetail = inv.retailPrice ? Number(inv.retailPrice) : (Number(inv.cost) * 1.3);

                return (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{inv.date}</td>
                    <td className="p-2">{inv.invNo}</td>
                    <td className="p-2 font-bold">{inv.item}</td>
                    <td className="p-2">{inv.qty}</td>
                    <td className="p-2 text-success font-bold">{stockLeft}</td>
                    <td className={`p-2 ${isExpired ? 'text-danger font-semibold' : ''}`}>{inv.expiry}</td>
                    <td className="p-2">${Number(inv.cost).toFixed(2)}</td>
                    <td className="p-2 font-bold text-accent">${displayRetail.toFixed(2)}</td>
                    
                    {/* Actions for Admin */}
                    {currentUser?.sysRole === 'admin' && (
                      <td className="p-2 text-center flex gap-1 justify-center">
                        <button
                          onClick={() => startEditDelivery(inv)}
                          className="bg-warning text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-amber-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            requestConfirm("Are you sure you want to delete this delivery record?", async () => {
                              await deleteDeliveryRecord(inv.id);
                            });
                          }}
                          className="bg-danger text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar Mini-Windows */}
        <div className="w-full md:w-80 space-y-4 shrink-0">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-secondary border-b pb-2 mb-3 text-xs">Staff On-Site</h4>
            <div className="space-y-2">
              {branchStaff.length > 0 ? (
                branchStaff.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-1.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-primary text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1">
                        {u.name}
                        <span className={`text-[8px] px-1 rounded uppercase font-bold text-white ${u.sysRole === 'admin' ? 'bg-danger' : 'bg-gray-400'}`}>
                          {u.sysRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">{u.jobRole}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-xs py-2">No staff assigned.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-secondary border-b pb-2 mb-3 text-xs flex items-center gap-1">
              🛒 Point of Sale (Sell Products)
            </h4>

            <div className="space-y-2 mb-3 text-xs">
              <select
                value={selectedPosItem}
                onChange={e => setSelectedPosItem(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50"
              >
                <option value="">Select Item to Sell...</option>
                {Object.entries(stockStatus).map(([item, details]) => (
                  <option key={item} value={item}>
                    {item} (Stock: {details.available}) - ${details.retailPrice.toFixed(2)}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={posQty}
                  onChange={e => setPosQty(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleAddToCart}
                  className="px-3 py-2 bg-warning text-gray-900 font-semibold rounded text-xs whitespace-nowrap hover:bg-amber-600"
                >
                  Add to Stack
                </button>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50/50 min-h-[80px] text-xs space-y-1">
              {currentCart.length === 0 ? (
                <p className="text-center text-gray-400 py-6">Cart is empty. Add items to stack.</p>
              ) : (
                currentCart.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
                    <div><strong>{c.item}</strong> (x{c.qty})</div>
                    <div className="flex items-center gap-2">
                      <span>${c.subtotal.toFixed(2)}</span>
                      <button onClick={() => removeFromCart(idx)} className="bg-danger text-white px-1.5 py-0.5 rounded text-[10px]">X</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center my-3 font-bold text-sm">
              <span>Total:</span>
              <span className="text-success">${grandTotalCart.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-2.5 bg-success text-white font-bold rounded text-xs hover:bg-green-600 transition"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};