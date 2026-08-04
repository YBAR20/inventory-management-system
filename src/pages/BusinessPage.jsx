import React from 'react';
import { useApp } from '../context/AppContext';

export const BusinessPage = () => {
  const { db, currentUser, setActiveBranch, setActivePage } = useApp();

  const isRestrictedAdmin = currentUser?.sysRole === 'admin' && currentUser?.branch !== 'Global';
  const visibleBranches = isRestrictedAdmin 
    ? db.branches.filter(b => b === currentUser.branch) 
    : db.branches;

  const handleBranchClick = (name) => {
    setActiveBranch(name);
    setActivePage('branchDetailPage');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-secondary mb-4">
        {isRestrictedAdmin ? "Assigned Branch Location" : "Select Branch Location"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleBranches.map(name => {
          const staffCount = db.users.filter(u => u.branch === name).length;
          return (
            <div
              key={name}
              onClick={() => handleBranchClick(name)}
              className="p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-accent hover:bg-gray-50/50 hover:translate-x-1 transition flex justify-between items-center"
            >
              <strong className="text-gray-800 text-sm">{name}</strong>
              <span className="px-2 py-1 bg-accent text-white rounded text-xs font-bold">
                {staffCount} Staff
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};