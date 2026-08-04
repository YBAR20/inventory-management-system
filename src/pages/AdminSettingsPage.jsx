import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { 
    db, currentUser, addUser, updateUser, deleteUser, 
    addBranch, editBranch, deleteBranch, triggerToast, requestConfirm 
  } = useApp();

  const isGlobalAdmin = currentUser?.sysRole === 'admin' && currentUser?.branch === 'Global';

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [visiblePassId, setVisiblePassId] = useState(null);
  
  const [newBranchName, setNewBranchName] = useState("");
  const [editingBranch, setEditingBranch] = useState(null);
  const [editBranchValue, setEditBranchValue] = useState("");

  const [newUser, setNewUser] = useState({
    name: '', username: '', password: '', jobRole: '', sysRole: 'employee', branch: isGlobalAdmin ? 'Global' : currentUser.branch
  });

  const [editUser, setEditUser] = useState({
    name: '', username: '', password: '', jobRole: '', sysRole: 'employee', branch: 'Global'
  });

  // Filter out workspace owners (founders) and other branches' personnel for restricted admins
  const visibleUsers = db.users.filter(u => {
    if (isGlobalAdmin) return true;
    // Restricted admin cannot see founders/global admins or users from other branches
    if (u.sysRole === 'admin' && u.branch === 'Global') return false;
    return u.branch === currentUser.branch;
  });

  const visibleBranches = isGlobalAdmin 
    ? db.branches 
    : db.branches.filter(b => b === currentUser.branch);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert("Name, Username, and Password are required.");
      return;
    }
    if (db.users.some(u => u.username === newUser.username.toLowerCase())) {
      alert("Username already exists.");
      return;
    }
    // Enforce branch assignment mapping for restricted admin
    const targetBranch = isGlobalAdmin ? newUser.branch : currentUser.branch;
    
    await addUser({ ...newUser, username: newUser.username.toLowerCase(), branch: targetBranch });
    setNewUser({ name: '', username: '', password: '', jobRole: '', sysRole: 'employee', branch: targetBranch });
    setShowAddForm(false);
    triggerToast("Employee added successfully", "success");
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditUser({ ...user });
    setShowAddForm(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser.name || !editUser.username || !editUser.password) {
      alert("Fields cannot be empty.");
      return;
    }
    const targetBranch = isGlobalAdmin ? editUser.branch : currentUser.branch;
    await updateUser(editingUserId, { ...editUser, username: editUser.username.toLowerCase(), branch: targetBranch });
    setEditingUserId(null);
    triggerToast("Employee details edited successfully", "success");
  };

  const handleAddBranch = async () => {
    if (!isGlobalAdmin) return alert("Only the workspace owner can create new branches.");
    if (!newBranchName.trim()) return;
    const success = await addBranch(newBranchName.trim());
    if (success) {
      setNewBranchName("");
    } else {
      alert("Branch already exists.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Accounts Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">
          {isGlobalAdmin ? "Staff Accounts & Access Control" : `${currentUser.branch} Branch Staff Management`}
        </h3>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingUserId(null); }}
          className="px-4 py-2 bg-success text-white text-xs font-semibold rounded hover:bg-green-600"
        >
          + Create New Employee
        </button>

        {showAddForm && (
          <form onSubmit={handleCreateUser} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-sm text-gray-700">Create New User</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Job Role</label>
                <input type="text" value={newUser.jobRole} onChange={e => setNewUser({ ...newUser, jobRole: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Username</label>
                <input type="text" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">System Role</label>
                <select value={newUser.sysRole} onChange={e => setNewUser({ ...newUser, sysRole: e.target.value })} className="w-full p-2 border rounded">
                  <option value="employee">Standard Employee</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              {isGlobalAdmin && (
                <div>
                  <label className="block font-semibold mb-1">Assign to Branch</label>
                  <select value={newUser.branch} onChange={e => setNewUser({ ...newUser, branch: e.target.value })} className="w-full p-2 border rounded">
                    <option value="Global">Global / All (Admins)</option>
                    {db.branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button type="submit" className="px-5 py-2 bg-blue-500 text-white font-bold text-xs rounded hover:bg-blue-600">
              Create Account
            </button>
          </form>
        )}

        {editingUserId && (
          <form onSubmit={handleUpdateUser} className="bg-blue-50/60 p-5 rounded-xl border border-blue-300 space-y-3">
            <h4 className="font-bold text-sm text-blue-900">Edit User Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Job Role</label>
                <input type="text" value={editUser.jobRole} onChange={e => setEditUser({ ...editUser, jobRole: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Username</label>
                <input type="text" value={editUser.username} onChange={e => setEditUser({ ...editUser, username: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password (Admin View)</label>
                <input type="text" value={editUser.password} onChange={e => setEditUser({ ...editUser, password: e.target.value })} className="w-full p-2 border border-blue-400 rounded font-bold" />
              </div>
              <div>
                <label className="block font-semibold mb-1">System Role</label>
                <select value={editUser.sysRole} onChange={e => setEditUser({ ...editUser, sysRole: e.target.value })} className="w-full p-2 border rounded">
                  <option value="employee">Standard Employee</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              {isGlobalAdmin && (
                <div>
                  <label className="block font-semibold mb-1">Assign to Branch</label>
                  <select value={editUser.branch} onChange={e => setEditUser({ ...editUser, branch: e.target.value })} className="w-full p-2 border rounded">
                    <option value="Global">Global / All (Admins)</option>
                    {db.branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700">Save Changes</button>
              <button type="button" onClick={() => setEditingUserId(null)} className="px-4 py-2 bg-gray-400 text-white font-bold text-xs rounded hover:bg-gray-500">Cancel</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                <th className="p-2">Name</th>
                <th className="p-2">Username</th>
                <th className="p-2">Password</th>
                <th className="p-2">Job Role</th>
                <th className="p-2">System Access</th>
                <th className="p-2">Assigned Branch</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(u => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="p-2 font-bold">{u.name}</td>
                  <td className="p-2"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">{u.username}</code></td>
                  <td className="p-2 font-mono">
                    {visiblePassId === u.id ? u.password : '••••••••'}
                    <button
                      onClick={() => setVisiblePassId(visiblePassId === u.id ? null : u.id)}
                      className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-[10px]"
                    >
                      {visiblePassId === u.id ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                    </button>
                  </td>
                  <td className="p-2">{u.jobRole}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 text-white font-bold rounded text-[9px] uppercase ${u.sysRole === 'admin' ? 'bg-danger' : 'bg-gray-400'}`}>
                      {u.sysRole}
                    </span>
                  </td>
                  <td className="p-2"><span className="border border-gray-200 px-2 py-0.5 rounded text-[10px]">{u.branch}</span></td>
                  <td className="p-2 flex gap-1">
                    <button onClick={() => startEdit(u)} className="px-2 py-1 bg-warning text-white rounded font-semibold text-[10px]">Edit</button>
                    {u.id !== currentUser.id && (
                      <button 
                        onClick={() => { 
                          requestConfirm("Are you sure you want to delete this record?", async () => {
                            await deleteUser(u.id);
                            triggerToast("Employee deleted or revoked successfully", "revoke");
                          });
                        }} 
                        className="px-2 py-1 bg-danger text-white rounded font-semibold text-[10px]"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Management Section (Restricted to assigned branch edit/delete for branch admins) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Branch Management</h3>
        
        {isGlobalAdmin && (
          <div className="flex gap-3 items-center border-b border-gray-100 pb-4">
            <input
              type="text"
              placeholder="New Branch Name..."
              value={newBranchName}
              onChange={e => setNewBranchName(e.target.value)}
              className="w-72 p-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleAddBranch}
              className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:bg-slate-800 transition"
            >
              Add Branch
            </button>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {visibleBranches.map(b => (
            <div key={b} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
              {editingBranch === b ? (
                <input 
                  type="text"
                  value={editBranchValue}
                  onChange={e => setEditBranchValue(e.target.value)}
                  className="flex-1 mr-4 p-1.5 border border-accent rounded text-sm font-semibold focus:outline-none"
                />
              ) : (
                <strong className="text-sm text-gray-700">{b}</strong>
              )}
              
              <div className="flex gap-2">
                {editingBranch === b ? (
                  <>
                    <button 
                      onClick={async () => {
                        if (editBranchValue.trim()) {
                          await editBranch(b, editBranchValue.trim());
                          setEditingBranch(null);
                        }
                      }} 
                      className="px-3 py-1 bg-success text-white text-[10px] font-bold rounded hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingBranch(null)} 
                      className="px-3 py-1 bg-gray-400 text-white text-[10px] font-bold rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setEditingBranch(b); setEditBranchValue(b); }} 
                      className="px-3 py-1 bg-warning text-white text-[10px] font-bold rounded hover:bg-amber-600 transition"
                    >
                      Edit
                    </button>
                    {isGlobalAdmin && (
                      <button 
                        onClick={() => {
                          requestConfirm(`Are you sure you want to delete the "${b}" branch?`, async () => {
                            await deleteBranch(b);
                          });
                        }} 
                        className="px-3 py-1 bg-danger text-white text-[10px] font-bold rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};