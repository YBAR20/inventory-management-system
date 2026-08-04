import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthPortal = () => {
  const { db, login, registerWorkspace, switchWorkspace } = useApp();
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [errorMsg, setErrorMsg] = useState("");

  // Login Form State
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register Form State
  const [regCompany, setRegCompany] = useState("");
  const [regName, setRegName] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const success = login(loginUser, loginPass);
    if (!success) setErrorMsg("Invalid username or password.");
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regCompany || !regName || !regUser || !regPass) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    registerWorkspace({ companyName: regCompany, name: regName, username: regUser, password: regPass });
  };

  return (
    <div className="flex h-screen w-full justify-center items-center bg-gradient-to-br from-secondary to-primary">
      {authView === 'login' ? (
        <div className="bg-white p-10 rounded-xl shadow-2xl w-96 text-center">
          <h2 className="text-2xl font-bold text-secondary mb-1">{db.currentWorkspace}</h2>
          <p className="text-gray-500 text-sm mb-5">Sign in to your workspace</p>
          {errorMsg && <div className="text-danger text-xs mb-4">{errorMsg}</div>}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-teal-600 transition"
            >
              Access System
            </button>
          </form>

          {/* Toggle and Workspace Selector Section */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
            <span
              onClick={() => { setAuthView('signup'); setErrorMsg(""); }}
              className="text-blue-500 underline cursor-pointer font-semibold"
            >
              Create a new business workspace
            </span>

            <div className="flex items-center gap-1">
              <span className="text-gray-400">Select business:</span>
              <select
                value={db.currentWorkspace}
                onChange={e => switchWorkspace(e.target.value)}
                className="p-1 border border-gray-300 rounded text-xs font-bold text-secondary bg-gray-50 focus:outline-none"
              >
                {db.workspaces.map(ws => (
                  <option key={ws} value={ws}>{ws}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow-2xl w-96 text-center">
          <h2 className="text-2xl font-bold text-secondary mb-2">Setup Workspace</h2>
          <p className="text-gray-500 text-sm mb-5">Register a brand new company</p>
          {errorMsg && <div className="text-danger text-xs mb-4">{errorMsg}</div>}

          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Company / Workspace Name"
              value={regCompany}
              onChange={e => setRegCompany(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Your Full Name"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Username"
              value={regUser}
              onChange={e => setRegUser(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Password"
              value={regPass}
              onChange={e => setRegPass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-teal-600 transition"
            >
              Create System
            </button>
          </form>
          <button
            onClick={() => { setAuthView('login'); setErrorMsg(""); }}
            className="mt-4 text-blue-500 text-xs underline cursor-pointer"
          >
            Already have an account? Login
          </button>
        </div>
      )}
    </div>
  );
};