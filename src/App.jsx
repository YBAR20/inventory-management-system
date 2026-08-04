import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { AuthPortal } from './components/AuthPortal';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { BusinessPage } from './pages/BusinessPage';
import { BranchDetailPage } from './pages/BranchDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AccountPage } from './pages/AccountPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export function AppContent() {
  const { currentUser, activePage, toast, confirmState, closeConfirm } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    return <AuthPortal />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 relative">
      
      {/* Toast Notification Component (Top Center) */}
      <div 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[80] transform transition-all duration-300 ease-out w-11/12 max-w-md text-center ${
          toast.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className={`bg-white px-6 py-3 rounded-full shadow-lg border-l-4 inline-flex items-center justify-center gap-3 ${
          toast.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
        }`}>
          <span className="font-bold text-xs sm:text-sm">{toast.message}</span>
        </div>
      </div>

      {/* Interactive Confirmation Pop-up */}
      {confirmState.visible && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4 bg-black/30 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-warning w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-warning text-lg font-bold flex items-center gap-2 mb-2">
              ⚠️ Warning
            </h3>
            <p className="text-sm text-gray-700 mb-6 font-medium">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeConfirm} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  if(confirmState.onConfirm) confirmState.onConfirm(); 
                  closeConfirm(); 
                }} 
                className="px-4 py-2 bg-danger text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Drawer */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activePage === 'dashboardPage' && <DashboardPage />}
          {activePage === 'businessPage' && <BusinessPage />}
          {activePage === 'branchDetailPage' && <BranchDetailPage />}
          {activePage === 'searchPage' && <SearchPage />}
          {activePage === 'accountPage' && <AccountPage />}
          {activePage === 'adminSettingsPage' && <AdminSettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}