import React from 'react';
import { useApp } from '../context/AppContext';

export const DashboardPage = () => {
  const { db, getBranchStockStatus, handleSearch } = useApp();

  let globalStockCost = 0;
  let globalRevenue = 0;
  let globalQtyLeft = 0;
  let itemSalesCounts = {};
  let expiredCount = 0;
  let allSales = [];
  const today = new Date();

  // Invoices & Expiry Check
  for (let b in db.invoices) {
    db.invoices[b].forEach(i => {
      globalStockCost += i.total;
      if (i.expiry && new Date(i.expiry) < today) expiredCount++;
    });
  }

  // Stock status & sales aggregated analysis
  for (let branch of db.branches) {
    let stock = getBranchStockStatus(branch);
    Object.values(stock).forEach(s => globalQtyLeft += s.available);

    if (db.sales[branch]) {
      db.sales[branch].forEach(sale => {
        globalRevenue += sale.total;
        allSales.push({ ...sale, branchName: branch });
        sale.items.forEach(soldItem => {
          itemSalesCounts[soldItem.item] = (itemSalesCounts[soldItem.item] || 0) + soldItem.qty;
        });
      });
    }
  }

  let sortedSales = Object.entries(itemSalesCounts).sort((a, b) => b[1] - a[1]);
  const topProduct = sortedSales.length > 0 ? sortedSales[0][0] : "No Sales";
  const leastSold = sortedSales.length > 1 ? sortedSales[sortedSales.length - 1][0] : "N/A";

  const triggerStatSearch = (type) => {
    if (type === 'expired') {
      handleSearch("!expired");
    } else if (type === 'top' && topProduct !== "No Sales") {
      handleSearch(topProduct);
    } else if (type === 'least' && leastSold !== "N/A") {
      handleSearch(leastSold);
    }
  };

  const maxQty = sortedSales.length > 0 ? sortedSales[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* Top Stat Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => triggerStatSearch('top')}
          className="bg-gradient-to-r from-accent to-teal-600 text-white p-4 rounded-xl text-center cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-xs uppercase font-semibold">🔥 Top Product</div>
          <span className="block text-xl font-bold mt-1">{topProduct}</span>
        </div>

        <div
          onClick={() => triggerStatSearch('least')}
          className="bg-blue-500 text-white p-4 rounded-xl text-center cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-xs uppercase font-semibold">📉 Least Sold</div>
          <span className="block text-xl font-bold mt-1">{leastSold}</span>
        </div>

        <div
          onClick={() => triggerStatSearch('expired')}
          className="bg-danger text-white p-4 rounded-xl text-center cursor-pointer transition transform hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-xs uppercase font-semibold">⚠️ Click for Expired Items</div>
          <span className="block text-xl font-bold mt-1">{expiredCount}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800">Executive Summary</h3>
        <p className="text-xs text-gray-500">Real-time analytical overview of company operations.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h4 className="font-bold text-secondary border-b pb-2 mb-4 text-sm">Top Selling Products</h4>
          <div className="space-y-4">
            {sortedSales.length > 0 ? (
              sortedSales.slice(0, 5).map(([item, qty]) => (
                <div key={item} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{item}</span>
                    <span>{qty} units sold</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${(qty / maxQty) * 100}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No sales data yet. Use Quick Sell to start.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h4 className="font-bold text-secondary border-b pb-2 mb-4 text-sm">Expiry Watchlist</h4>
          <div className="space-y-2">
            {Object.entries(db.invoices).flatMap(([branch, invs]) =>
              invs.filter(i => new Date(i.expiry) < today).map(i => (
                <div key={i.id} className="p-2 border-l-4 border-danger bg-red-50 text-xs flex justify-between items-center rounded">
                  <div>
                    <strong className="block text-gray-800">{i.item}</strong>
                    <span className="text-gray-400 text-[10px]">({branch})</span>
                  </div>
                  <div className="text-danger font-bold text-[11px]">EXPIRED: {i.expiry}</div>
                </div>
              ))
            ).length > 0 ? null : (
              <p className="text-xs text-success font-bold">✓ Healthy Inventory.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-secondary border-b pb-2 mb-2 text-sm">Global Performance</h4>
            <div className="text-xs text-gray-500 mb-1">Total Gross Revenue (Sales)</div>
            <div className="text-3xl font-bold text-success">${globalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <div>Stock Assets Value: <strong className="text-gray-700">${globalStockCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
              <div>Global Units in Stock: <strong className="text-gray-700">{globalQtyLeft.toLocaleString()}</strong></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1">
            <h4 className="font-bold text-secondary border-b pb-2 mb-4 text-sm">Recent Sales Activity</h4>
            <div className="space-y-2">
              {allSales.slice(-4).reverse().map(sale => (
                <div key={sale.id} className="p-2 border-b border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <strong className="block text-gray-800">{sale.items.length} items sold</strong>
                    <span className="text-gray-400 text-[10px]">Branch: {sale.branchName} • Ref: {sale.id}</span>
                  </div>
                  <div className="text-success font-bold">+${sale.total.toFixed(2)}</div>
                </div>
              ))}
              {allSales.length === 0 && <p className="text-xs text-gray-400">No recent sales.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};