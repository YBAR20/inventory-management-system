import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AccountPage = () => {
  const { currentUser, updateMyCredentials, setActivePage } = useApp();
  const [newUsername, setNewUsername] = useState(currentUser?.username || "");
  const [newPassword, setNewPassword] = useState(currentUser?.password || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert("Username and Password cannot be empty.");
      return;
    }
    updateMyCredentials(newUsername, newPassword);
  };

  const handleBackToQuickSell = () => {
    setActivePage('branchDetailPage');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
      <button 
        onClick={handleBackToQuickSell}
        className="mb-6 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded flex items-center gap-1 hover:bg-gray-200 transition"
      >
        ← Back to Quick Sell
      </button>

      <h3 className="text-lg font-bold text-gray-800 mb-1">Update My Credentials</h3>
      <p className="text-xs text-gray-500 mb-5">Change your personal system login details below.</p>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold mb-1">Current Full Name</label>
          <input
            type="text"
            value={currentUser?.name || ""}
            disabled
            className="w-full p-2.5 bg-gray-100 text-gray-500 border rounded cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Update Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">Update Password</label>
          <input
            type="text"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-teal-600 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};