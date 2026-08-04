import React from 'react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { db, currentUser, activePage, setActivePage, logout } = useApp();
  const isAdmin = currentUser?.sysRole === 'admin';

  const navItemClass = (page) =>
    `px-4 py-3 my-2 rounded-md cursor-pointer transition-all flex items-center gap-2 text-sm ${
      activePage === page ? 'bg-accent font-bold pl-5 text-white' : 'bg-white/5 hover:bg-accent hover:pl-5 hover:font-bold'
    }`;

  return (
    <aside className="w-60 bg-primary text-white p-5 flex flex-col h-screen shrink-0 select-none">
      <h2 className="text-xl font-light pb-3 mb-3 border-b border-white/10 truncate">
        {db.companyName}
      </h2>

      <div className="bg-black/20 p-3 rounded-md mb-6 text-xs flex justify-between items-center">
        <div className="flex flex-col">
          <strong className="text-sm">{currentUser?.name}</strong>
          <span className="text-accent font-semibold">
            {isAdmin ? "System Admin" : currentUser?.branch}
          </span>
        </div>
        <div className="text-xl">👤</div>
      </div>

      <nav className="flex-1 space-y-1">
        {isAdmin && (
          <>
            <div onClick={() => setActivePage('dashboardPage')} className={navItemClass('dashboardPage')}>
              📊 Global Dashboard
            </div>
            <div onClick={() => setActivePage('businessPage')} className={navItemClass('businessPage')}>
              🏢 Branch Locator
            </div>
            <div className="border-t border-white/10 my-4"></div>
          </>
        )}

        <div onClick={() => setActivePage('accountPage')} className={navItemClass('accountPage')}>
          🔐 My Account
        </div>

        {isAdmin && (
          <div onClick={() => setActivePage('adminSettingsPage')} className={navItemClass('adminSettingsPage')}>
            ⚙️ Admin & Staff
          </div>
        )}
      </nav>

      <button
        onClick={logout}
        className="mt-auto p-3 bg-danger rounded-md text-center font-bold text-sm hover:bg-red-600 transition"
      >
        Logout System
      </button>
    </aside>
  );
};