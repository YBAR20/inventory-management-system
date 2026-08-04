import React from 'react';
import { useApp } from '../context/AppContext';

export const SearchPage = () => {
  const { searchQuery, handleSearch, db, currentUser } = useApp();
  const inputStr = searchQuery.toLowerCase();

  let searchResults = [];

  for (let branch in db.invoices) {
    if (currentUser?.sysRole !== 'admin' && branch !== currentUser?.branch) continue;

    db.invoices[branch].forEach(inv => {
      let isMatch = inputStr === "!expired"
        ? (new Date(inv.expiry) < new Date())
        : inv.item.toLowerCase().includes(inputStr);

      if (isMatch) {
        searchResults.push({ ...inv, branchName: branch });
      }
    });
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          {inputStr === "!expired" ? "⚠️ Expired Items" : `Results for "${searchQuery}"`}
        </h3>
        <button
          onClick={() => handleSearch("")}
          className="px-4 py-1.5 bg-gray-400 text-white rounded text-xs font-semibold hover:bg-gray-500"
        >
          Close Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
              <th className="p-2">Branch</th>
              <th className="p-2">Date</th>
              <th className="p-2">Supplier</th>
              <th className="p-2">Inv #</th>
              <th className="p-2">Item Name</th>
              <th className="p-2">Initial Qty</th>
              <th className="p-2">Expiry</th>
              <th className="p-2">Unit Cost</th>
              <th className="p-2">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.length > 0 ? (
              searchResults.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100">
                  <td className="p-2"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{inv.branchName}</span></td>
                  <td className="p-2">{inv.date}</td>
                  <td className="p-2">{inv.supplier}</td>
                  <td className="p-2">{inv.invNo}</td>
                  <td className="p-2 font-bold">{inv.item}</td>
                  <td className="p-2">{inv.qty}</td>
                  <td className={`p-2 font-bold ${new Date(inv.expiry) < new Date() ? 'text-danger' : ''}`}>{inv.expiry}</td>
                  <td className="p-2">${inv.cost}</td>
                  <td className="p-2">${inv.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-400">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};