import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db as firestoreDb } from '../firebase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const savedSession = localStorage.getItem("enterprise_os_user");
  const initialUser = savedSession ? JSON.parse(savedSession) : null;
  const savedPage = localStorage.getItem("enterprise_os_page");
  const savedBranch = localStorage.getItem("enterprise_os_branch");
  const savedWorkspace = localStorage.getItem("enterprise_os_workspace") || "Enterprise OS";

  const [dbData, setDbData] = useState({
    workspaces: ["Enterprise OS"],
    currentWorkspace: savedWorkspace,
    branches: [],
    users: [],
    invoices: {},
    sales: {}
  });

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [activeBranch, setActiveBranch] = useState(
    initialUser && initialUser.sysRole === 'admin' && initialUser.branch !== 'Global' 
      ? initialUser.branch 
      : (savedBranch || (initialUser && initialUser.sysRole !== 'admin' ? initialUser.branch : ""))
  );
  
  const [activePage, setActivePage] = useState(
    savedPage || (initialUser ? (initialUser.sysRole === 'admin' ? 'dashboardPage' : 'branchDetailPage') : "dashboardPage")
  );
  
  const [currentCart, setCurrentCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [confirmState, setConfirmState] = useState({ visible: false, message: '', onConfirm: null });

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const requestConfirm = (message, onConfirmCallback) => {
    setConfirmState({ visible: true, message, onConfirm: onConfirmCallback });
  };

  const closeConfirm = () => {
    setConfirmState({ visible: false, message: '', onConfirm: null });
  };

  useEffect(() => {
    if (activePage) localStorage.setItem("enterprise_os_page", activePage);
  }, [activePage]);

  useEffect(() => {
    if (activeBranch) localStorage.setItem("enterprise_os_branch", activeBranch);
  }, [activeBranch]);

  // Force branch-restricted admin onto their assigned branch view
  useEffect(() => {
    if (currentUser && currentUser.sysRole === 'admin' && currentUser.branch !== 'Global') {
      setActiveBranch(currentUser.branch);
    }
  }, [currentUser]);

  // ----------------------------------------------------
  // REAL-TIME FIRESTORE LISTENERS
  // ----------------------------------------------------
  useEffect(() => {
    const wsPrefix = dbData.currentWorkspace;

    const unsubWorkspaces = onSnapshot(collection(firestoreDb, "workspaces"), (snapshot) => {
      const wsList = snapshot.docs.map(d => d.data().name);
      if (wsList.length === 0) {
        setDoc(doc(firestoreDb, "workspaces", "Enterprise OS"), { name: "Enterprise OS" });
      } else {
        setDbData(prev => ({ ...prev, workspaces: wsList }));
      }
    });

    const unsubBranches = onSnapshot(collection(firestoreDb, `${wsPrefix}_branches`), (snapshot) => {
      const branchesList = snapshot.docs.map(d => d.data().name);
      if (branchesList.length === 0 && wsPrefix === "Enterprise OS") {
        const defaultBranches = ["Accra Main", "Tema Distribution", "Kumasi Retail"];
        defaultBranches.forEach(b => setDoc(doc(firestoreDb, `${wsPrefix}_branches`, b), { name: b }));
      } else {
        setDbData(prev => ({ ...prev, branches: branchesList }));
      }
    });

    const unsubUsers = onSnapshot(collection(firestoreDb, `${wsPrefix}_users`), (snapshot) => {
      const usersList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (usersList.length === 0 && wsPrefix === "Enterprise OS") {
        const initialUsers = [
          { username: 'admin', password: '123', name: 'Admin', jobRole: 'System Owner', sysRole: 'admin', branch: 'Global' },
          { username: 'alice', password: '123', name: 'Alice Arhin', jobRole: 'Store Manager', sysRole: 'employee', branch: 'Accra Main' },
          { username: 'kofi', password: '123', name: 'Kofi Mensah', jobRole: 'Security', sysRole: 'employee', branch: 'Accra Main' }
        ];
        initialUsers.forEach(u => addDoc(collection(firestoreDb, `${wsPrefix}_users`), u));
      } else {
        setDbData(prev => ({ ...prev, users: usersList }));
      }
    });

    const unsubInvoices = onSnapshot(collection(firestoreDb, `${wsPrefix}_invoices`), (snapshot) => {
      const grouped = {};
      snapshot.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        if (!grouped[item.branch]) grouped[item.branch] = [];
        grouped[item.branch].push(item);
      });
      setDbData(prev => ({ ...prev, invoices: grouped }));
    });

    const unsubSales = onSnapshot(collection(firestoreDb, `${wsPrefix}_sales`), (snapshot) => {
      const grouped = {};
      snapshot.docs.forEach(d => {
        const sale = { id: d.id, ...d.data() };
        if (!grouped[sale.branch]) grouped[sale.branch] = [];
        grouped[sale.branch].push(sale);
      });
      setDbData(prev => ({ ...prev, sales: grouped }));
    });

    return () => {
      unsubWorkspaces();
      unsubBranches();
      unsubUsers();
      unsubInvoices();
      unsubSales();
    };
  }, [dbData.currentWorkspace]);

  useEffect(() => {
    if (currentUser) {
      const freshUserDoc = dbData.users.find(u => u.id === currentUser.id);
      if (freshUserDoc) {
        setCurrentUser(freshUserDoc);
        localStorage.setItem("enterprise_os_user", JSON.stringify(freshUserDoc));
      }
    }
  }, [dbData.users]);

  const switchWorkspace = (wsName) => {
    setDbData(prev => ({ ...prev, currentWorkspace: wsName }));
    localStorage.setItem("enterprise_os_workspace", wsName);
    logout();
  };

  const login = (username, password) => {
    const userStr = username.trim().toLowerCase();
    const foundUser = dbData.users.find(u => u.username.toLowerCase() === userStr && u.password === password);
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem("enterprise_os_user", JSON.stringify(foundUser));

      if (foundUser.sysRole === 'admin') {
        if (foundUser.branch !== 'Global') {
          setActiveBranch(foundUser.branch);
          setActivePage('branchDetailPage');
        } else {
          setActivePage('dashboardPage');
        }
      } else {
        setActiveBranch(foundUser.branch);
        setActivePage('branchDetailPage');
      }
      return true;
    }
    return false;
  };

  const registerWorkspace = async ({ companyName, name, username, password }) => {
    await setDoc(doc(firestoreDb, "workspaces", companyName), { name: companyName });
    await setDoc(doc(firestoreDb, `${companyName}_branches`, "Headquarters"), { name: "Headquarters" });
    
    const newAdmin = {
      username: username.toLowerCase(),
      password,
      name,
      jobRole: 'Founder',
      sysRole: 'admin',
      branch: 'Global'
    };

    const docRef = await addDoc(collection(firestoreDb, `${companyName}_users`), newAdmin);
    const completedUser = { id: docRef.id, ...newAdmin };
    
    setDbData(prev => ({ ...prev, currentWorkspace: companyName }));
    localStorage.setItem("enterprise_os_workspace", companyName);

    setCurrentUser(completedUser);
    localStorage.setItem("enterprise_os_user", JSON.stringify(completedUser));
    setActivePage('dashboardPage');
    triggerToast(`Workspace "${companyName}" created successfully`, "success");
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("enterprise_os_user");
    localStorage.removeItem("enterprise_os_page");
    localStorage.removeItem("enterprise_os_branch");
    setActiveBranch("");
    setCurrentCart([]);
    setSearchQuery("");
  };

  const updateMyCredentials = async (newUsername, newPassword) => {
    const wsPrefix = dbData.currentWorkspace;
    const usernameTaken = dbData.users.some(u => u.username === newUsername && u.id !== currentUser.id);
    if (usernameTaken) return { success: false, message: "Username is already taken." };

    await updateDoc(doc(firestoreDb, `${wsPrefix}_users`, currentUser.id), {
      username: newUsername,
      password: newPassword
    });

    triggerToast("Credentials updated successfully", "success");
    return { success: true, message: "Credentials updated in Firebase!" };
  };

  const getBranchStockStatus = (branchName) => {
    let stock = {};
    if (dbData.invoices[branchName]) {
      dbData.invoices[branchName].forEach(inv => {
        if (!stock[inv.item]) stock[inv.item] = { qtyIn: 0, qtyOut: 0, cost: inv.cost, retailPrice: inv.retailPrice };
        stock[inv.item].qtyIn += Number(inv.qty);
        stock[inv.item].cost = Number(inv.cost);
        
        if (inv.retailPrice) {
          stock[inv.item].retailPrice = Number(inv.retailPrice);
        }
      });
    }
    if (dbData.sales[branchName]) {
      dbData.sales[branchName].forEach(sale => {
        sale.items.forEach(soldItem => {
          if (stock[soldItem.item]) stock[soldItem.item].qtyOut += Number(soldItem.qty);
        });
      });
    }

    let availableStock = {};
    for (const item in stock) {
      let left = stock[item].qtyIn - stock[item].qtyOut;
      if (left > 0) {
        const finalRetailPrice = stock[item].retailPrice ? stock[item].retailPrice : (stock[item].cost * 1.3);
        
        availableStock[item] = {
          available: left,
          cost: stock[item].cost,
          retailPrice: Number(finalRetailPrice.toFixed(2))
        };
      }
    }
    return availableStock;
  };

  const addToCart = (item, price, qty, maxAvailable) => {
    const existing = currentCart.find(c => c.item === item);
    const plannedQty = existing ? existing.qty + qty : qty;

    if (plannedQty > maxAvailable) {
      return { success: false, message: `Only ${maxAvailable} units available in Firebase.` };
    }

    if (existing) {
      setCurrentCart(currentCart.map(c => c.item === item ? { ...c, qty: plannedQty, subtotal: plannedQty * price } : c));
    } else {
      setCurrentCart([...currentCart, { item, qty, price, subtotal: qty * price }]);
    }
    return { success: true };
  };

  const removeFromCart = (index) => {
    setCurrentCart(currentCart.filter((_, idx) => idx !== index));
  };

  const checkoutSale = async () => {
    const wsPrefix = dbData.currentWorkspace;
    if (currentCart.length === 0) return false;
    const grandTotal = currentCart.reduce((sum, i) => sum + i.subtotal, 0);

    const newSale = {
      saleRef: 'SL-' + Math.floor(Math.random() * 10000),
      date: new Date().toISOString().split('T')[0],
      branch: activeBranch,
      items: [...currentCart],
      total: grandTotal,
      cashier: currentUser.name
    };

    await addDoc(collection(firestoreDb, `${wsPrefix}_sales`), newSale);
    setCurrentCart([]);
    triggerToast(`Sale completed successfully! Total: $${grandTotal.toFixed(2)}`, "success");
    return grandTotal;
  };

  const addDeliveryRecord = async (branchName, delivery) => {
    const wsPrefix = dbData.currentWorkspace;
    const record = {
      ...delivery,
      branch: branchName,
      qty: Number(delivery.qty),
      cost: Number(delivery.cost),
      retailPrice: Number(delivery.retailPrice),
      total: Number(delivery.qty) * Number(delivery.cost)
    };
    await addDoc(collection(firestoreDb, `${wsPrefix}_invoices`), record);
    triggerToast("Delivery added successfully", "success");
  };

  const editDeliveryRecord = async (recordId, updatedData) => {
    const wsPrefix = dbData.currentWorkspace;
    const record = {
      ...updatedData,
      qty: Number(updatedData.qty),
      cost: Number(updatedData.cost),
      retailPrice: Number(updatedData.retailPrice),
      total: Number(updatedData.qty) * Number(updatedData.cost)
    };
    await updateDoc(doc(firestoreDb, `${wsPrefix}_invoices`, recordId), record);
    triggerToast("Delivery updated successfully", "success");
  };

  const deleteDeliveryRecord = async (recordId) => {
    const wsPrefix = dbData.currentWorkspace;
    await deleteDoc(doc(firestoreDb, `${wsPrefix}_invoices`, recordId));
    triggerToast("Delivery record deleted successfully", "revoke");
  };

  const addBranch = async (branchName) => {
    const wsPrefix = dbData.currentWorkspace;
    if (dbData.branches.includes(branchName)) return false;
    await setDoc(doc(firestoreDb, `${wsPrefix}_branches`, branchName), { name: branchName });
    triggerToast(`Branch "${branchName}" created`, "success");
    return true;
  };

  const editBranch = async (oldName, newName) => {
    const wsPrefix = dbData.currentWorkspace;
    if (!newName || newName === oldName) return false;
    if (dbData.branches.includes(newName)) {
      triggerToast("Branch name already exists", "revoke");
      return false;
    }
    await setDoc(doc(firestoreDb, `${wsPrefix}_branches`, newName), { name: newName });
    await deleteDoc(doc(firestoreDb, `${wsPrefix}_branches`, oldName));
    triggerToast(`Branch renamed to "${newName}"`, "success");
    return true;
  };

  const deleteBranch = async (branchName) => {
    const wsPrefix = dbData.currentWorkspace;
    await deleteDoc(doc(firestoreDb, `${wsPrefix}_branches`, branchName));
    triggerToast(`Branch "${branchName}" deleted successfully`, "revoke");
    return true;
  };

  const addUser = async (userData) => {
    const wsPrefix = dbData.currentWorkspace;
    await addDoc(collection(firestoreDb, `${wsPrefix}_users`), userData);
  };

  const updateUser = async (id, updatedData) => {
    const wsPrefix = dbData.currentWorkspace;
    await updateDoc(doc(firestoreDb, `${wsPrefix}_users`, id), updatedData);
  };

  const deleteUser = async (id) => {
    const wsPrefix = dbData.currentWorkspace;
    await deleteDoc(doc(firestoreDb, `${wsPrefix}_users`, id));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setActivePage('searchPage');
    } else {
      setActivePage(currentUser?.sysRole === 'admin' && currentUser?.branch === 'Global' ? 'dashboardPage' : 'branchDetailPage');
    }
  };

  return (
    <AppContext.Provider value={{
      db: dbData,
      currentUser,
      activeBranch,
      setActiveBranch,
      activePage,
      setActivePage,
      currentCart,
      searchQuery,
      toast,
      triggerToast,
      confirmState,
      requestConfirm,
      closeConfirm,
      switchWorkspace,
      login,
      registerWorkspace,
      logout,
      updateMyCredentials,
      getBranchStockStatus,
      addToCart,
      removeFromCart,
      checkoutSale,
      addDeliveryRecord,
      editDeliveryRecord,
      deleteDeliveryRecord,
      addBranch,
      editBranch,
      deleteBranch,
      addUser,
      updateUser,
      deleteUser,
      handleSearch
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);