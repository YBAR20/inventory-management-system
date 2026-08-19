# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# About the Project
Enterprise OS is a robust, real-time web application designed to manage multi-branch retail or warehouse operations. It bridges the gap between localized branch management and high-level global oversight.

Retail businesses with multiple physical locations often suffer from fragmented data. Branch A doesn't know what Branch B has in stock. Headquarters relies on delayed, end-of-week reporting to calculate total revenue or asset values. Enterprise OS solves this by unifying Sales, Inventory, Staff, and Communications into a single, real-time ecosystem powered by Firebase.

## Core Objectives:
Real-Time Synchronization: Every sale, delivery, and message updates instantly across all active clients globally.

Cross-Branch Visibility: Allow branches to search each other's inventory to fulfill customer requests.

Automated Stock Transfers: Replace manual phone calls with a digital, traceable request-and-approve stock transfer system.

Proactive Expiry Management: Automatically monitor incoming inventory dates and flag items expiring within 30 days.

# System Architecture & Technology Stack
The system is built as a Single Page Application (SPA) prioritizing speed, modularity, and real-time data binding.

  mermaid
  graph TD
      subgraph Client Application ["Client Application (React.js)"]
          direction TB
          UI_Dash[Global Dashboard]
          UI_POS[POS & Inventory]
          UI_Comms[Branch Comms Hub]
          UI_Search[Global Search]
        
        Context((AppContext \nGlobal State))
        
        UI_Dash <-->|Read Metrics| Context
        UI_POS <-->|Read/Write Stock| Context
        UI_Search <-->|Query Global Stock| Context
        UI_Comms <-->|Read/Write DMs| Context
    end

    subgraph Firebase Cloud ["Firebase Backend (BaaS)"]
        direction TB
        Firestore[(Firestore NoSQL)]
        
        C_Users[[_users]]
        C_Sales[[_sales]]
        C_Invoices[[_invoices]]
        C_Messages[[_messages]]
        C_Branches[[_branches]]
        
        Firestore --- C_Users
        Firestore --- C_Sales
        Firestore --- C_Invoices
        Firestore --- C_Messages
        Firestore --- C_Branches
    end

    %% Data Flow Lines
    Context ==>|1. Async Writes (addDoc, updateDoc)| Firestore
    Firestore -.->|2. Real-Time Listeners (onSnapshot)| Context
    
    %% Styling
    classDef client fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef backend fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef state fill:#10b981,stroke:#059669,stroke-width:3px,color:#fff;
    
    class UI_Dash,UI_POS,UI_Comms,UI_Search client;
    class Firestore,C_Users,C_Sales,C_Invoices,C_Messages,C_Branches backend;
    class Context state;

# How It Works: The Lifecycle of Data
Enterprise OS does not use a traditional REST API (where the client constantly asks the server "has anything changed?"). Instead, it uses an Event-Driven, Real-Time Sync model. Here is exactly how data moves through the system:

1. The AppContext (The Brain)
When a user logs in, the AppContext.jsx mounts and immediately opens continuous WebSocket connections (onSnapshot) to the Firebase Firestore database for their specific workspace.

It downloads all Users, Sales, Invoices, and Messages into a central JSON state called dbData.

All UI components (Dashboard, POS, Comms) read their information directly from this local dbData state, making the app feel instantaneous with zero loading spinners.

2. Writing Data (e.g., Making a Sale or Sending a Message)
When a branch employee completes a transaction in the POS:

The UI component calls checkoutSale() inside the AppContext.

The AppContext bundles the cart items and pushes an addDoc request to the Firebase Cloud.

Crucially, the UI does not wait for a refreshed page.

3. Real-Time Propagation (The Magic)
The moment that new sale is saved in the Firestore Cloud database:

Firebase instantly broadcasts that change back to every connected device globally.

The onSnapshot listener in the AppContext catches the new sale and updates dbData.

Because React watches dbData, the UI instantly re-renders.

The Result: If Branch A makes a sale, the Global Dashboard on the Admin's screen updates the total revenue, top-selling items, and global assets in less than 300 milliseconds.

4. On-the-Fly Aggregation (No Redundant Tables)
To prevent databases from becoming out-of-sync, Enterprise OS relies heavily on client-side calculation rather than database triggers.

There is no database table for "Current Stock."

When you open the POS, the app looks at invoices (Stock In) and subtracts sales (Stock Out) dynamically.

If a transfer request is approved, the system simply writes an automated "Sale" for the sender and an automated "Invoice" for the receiver. The real-time aggregation engine handles the rest, ensuring that a branch can never sell inventory they do not mathematically possess.

## Front-End (Client-Side)
React.js (Functional Components & Hooks): The core UI framework.

React Context API (AppContext.jsx): Acts as the central nervous system. It holds the global state, manages Firestore listeners, and handles all CRUD (Create, Read, Update, Delete) operations to prevent prop-drilling.

Tailwind CSS: A utility-first CSS framework used for highly responsive, modern UI design.

Lucide React: Provides clean, consistent SVG iconography.

## Back-End (Backend-as-a-Service)
Firebase Firestore: A NoSQL cloud database. The app utilizes onSnapshot listeners to subscribe to collections. When a document changes in the cloud, the React Context state updates, triggering an instant UI re-render.

## State Management Lifecycle
User interacts with UI (e.g., clicks "Confirm Stock Transfer").

Component calls a function from AppContext.

AppContext executes asynchronous Firebase Firestore updates (updateDoc, addDoc).

Firestore registers the change.

The onSnapshot listener detects the change and updates dbData.

React propagates the new dbData to all child components.

# User Roles & Access Control (RBAC)
Enterprise OS utilizes a strict Role-Based Access Control system tied to the user's sysRole and branch attributes.

## 1. System Admin (Global Admin)
Identity: sysRole: 'admin', branch: 'Global'

Abilities: Has absolute control over the workspace. Can create/delete branches, create/revoke staff accounts, reset admin passwords, and view the Global Dashboard.

Operating Location: System Admins can use the "Set as Main" feature to dynamically switch which branch they are actively operating out of, affecting where their messages are sent from.

## 2. Branch Admin
Identity: sysRole: 'admin', branch: '[Specific Branch Name]'

Abilities: Manages their specific location. They can view the Global Search and Comms Hub, but they cannot view the Global Dashboard, delete branches, or manage staff outside their assigned branch.

## 3. Standard Employee (Staff)
Identity: sysRole: 'employee', branch: '[Specific Branch Name]'

Abilities: Strictly operational. They only have access to the Quick Sell / POS and Inventory Deliveries modules for their assigned branch. They cannot access the Comms Hub, Search Page, or Settings.

## 4. Installation & Setup Guide
To run this system locally or deploy it to a server, follow these terminal instructions.

Prerequisites
Node.js (v16.0 or higher)

npm or yarn

A Google Firebase Account

# Step-by-Step Setup
## 1. Clone the Repository
Bash
git clone https://github.com/your-username/enterprise-os.git
cd enterprise-os

## 2. Install Dependencies
Bash
npm install

## 3. Configure Firebase
Create a .env file in the root directory and add your Firebase configuration variables:

## Code snippet

    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

## 4. Initialize the Project
Bash
npm run dev
## 5. First-Time Workspace Creation
Open the application in your browser (http://localhost:5173). Because the database is empty, the Auth Portal will default to the "Create New Workspace" screen. Enter your company details, set your Admin Phone Number, and initialize the system.

# 5. Module 1: The Global Dashboard
The Dashboard (DashboardPage.jsx) is restricted to the System Admin. It computes massive amounts of raw ledger data into digestible, real-time insights.

## Core Components:
Top Metrics Row:

Total Revenue: Aggregates the total of all documents in the sales collection across all branches.

Top Product / Least Sold: Parses through every item array in every sale document, building a frequency map to dynamically determine the most and least popular items globally.

Expired Items Modal: Displays an immediate count of items whose expiry date has passed. Clicking it opens a deep-dive list detailing exactly which branch holds the expired stock.

Global Performance Leaderboard: Ranks active branches dynamically by parsing the sales revenue tied to their specific branch keys. Branches with $0 revenue remain on the board to indicate underperformance.

Inventory Assets Engine: Calculates the real-time Global Units In Stock and the total Stock Assets Value (Cost × Available Qty) globally, enabling instant financial auditing without running manual reports.

## Expiry Watchlist Algorithm
The Expiry Watchlist scans all delivery invoices across the network. It calculates the time difference between the current date and the stored expiry date string. Any item with daysLeft <= 30 is pulled into the watchlist array, sorted by most critical (lowest days left), and rendered with dynamic color coding (Red for expired, Yellow for expiring soon).

# 6. Module 2: Inventory & Deliveries
Located within BranchDetailPage.jsx, this module handles the inflow of goods.

When stock arrives at a physical location, the staff logs an Invoice/Delivery.
Required data points include:

Item Name

Quantity (qtyIn)

Unit Cost (What the business paid)

Retail Price (What the customer pays)

Expiry Date (Optional)

Dynamic Costing: The system uses a "Latest Delivery" pricing model. If Branch A receives 10 units of "Apple" at $1.00, and later receives 10 more at $1.50, the system updates the global tracker to use the latest cost basis for asset calculations.

# 7. Module 3: Quick Sell & Point of Sale (POS)
The POS interface allows branch staff to convert inventory into revenue.

## How it Works:
Available Stock Calculation: The system runs getBranchStockStatus(). It looks at all incoming deliveries (qtyIn) and subtracts all historical sales (qtyOut) for that specific branch. It only displays items to the cashier where qtyIn - qtyOut > 0.

Cart Management: Staff click items to add them to a virtual cart array stored in React State. The system prevents adding quantities that exceed the maximum available stock.

Checkout: When the cashier finalizes the transaction, a JSON payload is constructed containing a random Sale Reference ID, the timestamp, the cashier's name, and the array of items. This payload is pushed to the Firestore sales collection.

Instant Deduction: The moment the sale document hits Firestore, the global onSnapshot updates dbData. The available stock on the screen drops instantly without a page refresh.

# 8. Module 4: Global Inventory Search
The Global Inventory Search (SearchPage.jsx) breaks down silos between physical locations.

## Privacy & Self-Request Prevention
When a user searches for an item, the system scans dbData.invoices across all branches.
Rule: The system explicitly filters out the user's own branch from the search results. This prevents staff from accidentally attempting to request stock from their own warehouse.

## Automated Stock Requests
Instead of making phone calls to see if another branch can spare inventory, users simply input the quantity they need in the search result card and click Request Stock.
This generates a system-formatted text string combined with a hidden JSON payload (transferData), pushing it directly into the target branch's private DM channel.

# 9. Module 5: Branch Communications Hub (Comms)
The CommsPage.jsx is the most sophisticated module in the OS. It operates as a 2-Way Direct Messaging system with integrated inventory action buttons.

## The 2-Way DM Filter
Branches do not have public chat rooms. To prevent cluttered, noisy environments, all messaging is structured as Point-to-Point DMs.

The Channel List: Renders a list of all branches except the user's own location.

The Filter Logic: The UI only renders messages where (sender == Me AND receiver == Them) OR (sender == Them AND receiver == Me).

Inbox Behavior: There is no "Inbox" button. To check if Branch B replied to Branch A, Branch A simply clicks on Branch B's name in the channel list.

## The Interactive Stock Transfer Lifecycle
When an Admin requests stock from the Search Page, a message is generated with a transferData object:

    JSON
    {
      "item": "Samsung TV",
      "qty": 5,
      "requesterBranch": "Accra Main",
      "status": "pending"
    }

## The UI Reaction:

For the Sender (Accra Main): They see their message bubble with a UI tag reading: ⏳ Pending Approval from Tema Distribution...

For the Receiver (Tema Distribution): They see the incoming bubble with two actionable buttons: [Confirm & Deduct] and [Deny].

## The confirmStockTransfer Execution:
If Tema clicks Confirm, the AppContext executes a multi-step transaction:

Deduct from Provider: Creates a $0 "Sale" record in Tema's ledger called TRF-OUT-1234 to subtract 5 units from their stock.

Add to Requester: Creates a new "Invoice/Delivery" record in Accra's ledger called TRF-IN-1234 adding 5 units. It automatically inherits the unit cost and retail price from Tema's original invoice.

Update Message State: Changes the message status to confirmed. The buttons disappear, replaced by a green checkmark indicating who approved it.

# 10. Module 6: Admin Settings & Staff Management
The AdminSettingsPage.jsx provides total control over workspace parameters.

Branch Management: Global Admins can add, rename, or delete entire branches.

Admin Operating Base: Global Admins have a Set as Main button. Because Global Admins do not technically exist in a physical location, this button allows them to virtually bind their identity to a specific branch. When they send messages, it will appear to come from the selected Main Branch rather than a generic "Headquarters".

Staff Creation: Create user credentials. Passwords are masked by default but can be revealed via a toggle. Staff can be revoked instantly, which deletes their Firestore document and immediately logs them out of any active sessions via the useEffect user validation check.

# 11. Detailed Data Workflows & Logic
Enterprise OS relies heavily on data parsing rather than redundant database storage.

Instead of maintaining a separate "Current Stock" collection in Firebase, the system calculates stock on the fly every time data changes:

JavaScript
const availableStock = totalQtyIncoming (from Invoices) - totalQtyOutgoing (from Sales)
While computationally slightly heavier on the client-side, this approach completely eliminates data desynchronization. It guarantees that inventory levels are always a mathematically perfect reflection of historical ledgers.

# 12. Firebase Firestore Database Schema
The database uses dynamic collection prefixes based on the Workspace name to allow multi-tenant architecture on a single database. If the workspace is "AlphaCorp", the collections are prefixed as AlphaCorp_.

## 1. workspaces (Collection)
Tracks registered companies.

    JSON
    {
      "name": "AlphaCorp"
    }

## 2. [Workspace]_users (Collection)

    JSON
    {
      "name": "John Doe",
      "username": "john.d",
      "password": "secure123",
      "phone": "1234567890",
      "jobRole": "Manager",
      "sysRole": "admin",
      "branch": "Accra Main",
      "adminLocation": "Accra Main" 
    }

## 3. [Workspace]_sales (Collection)

    JSON
    {
      "saleRef": "SL-9482",
      "date": "2026-08-19",
      "branch": "Accra Main",
      "cashier": "John Doe",
      "total": 450.00,
      "items": [
        { "item": "Widget", "qty": 2, "price": 225.00, "subtotal": 450.00 }
      ]
    }

## 4. [Workspace]_invoices (Collection)

    JSON
    {
      "invNo": "INV-101",
      "date": "2026-08-01",
      "branch": "Tema Distribution",
      "supplier": "Acme Corp",
      "item": "Widget",
      "qty": 100,
      "cost": 150.00,
      "retailPrice": 225.00,
      "total": 15000.00,
      "expiry": "2026-09-15"
    }

## 5. [Workspace]_messages (Collection)

    JSON
    {
      "text": "📦 [Stock Transfer Request]...",
      "senderId": "user123",
      "senderName": "John Doe",
      "senderRole": "admin",
      "senderBranch": "Accra Main",
      "targetBranch": "Tema Distribution",
      "timestamp": "2026-08-19T14:30:00Z",
      "transferData": {
        "item": "Widget",
        "qty": 5,
        "requesterBranch": "Accra Main",
        "status": "pending"
      }
    }

# 13. Security, Privacy & Data Isolation
## Account Recovery
If a System Admin forgets their password, they cannot rely on standard email links in closed networks. Instead, the AuthPortal features an Admin Account Recovery flow. By providing the exact phone number mapped to the sysRole: 'admin' profile, the system authorizes a username and password reset without compromising underlying data.

## Message Chat Clearing Logic
The "Clear Chats" function executes a conditional safety check:

System Admins have a Clear Chats button that pulls the IDs of all messages currently rendered on screen and deletes them permanently from Firestore.

Branch Admins only see a Delete My Chats button. The logic filters the current messages, plucking out only the document IDs where senderBranch === myLocation. They can wipe their side of a conversation, but cannot delete records of what other branches have said to them.

# 14. Troubleshooting & FAQ
Q: A branch just received stock, but the Global Dashboard assets didn't update.
A: Ensure the user's internet connection is active. The onSnapshot listener updates the Global Dashboard instantly, provided the Firebase backend successfully receives the addDoc payload.

Q: A branch cannot see the Comms Hub.
A: Check their sysRole. Only accounts with sysRole: 'admin' are permitted to access the Comms Hub and Search features.

Q: When an admin clicks "Confirm Transfer", it fails to deduct stock.
A: Verify that the exact item name matches. The system uses a strict string comparison transferData.item.toLowerCase() === inv.item.toLowerCase() to inherit the original cost parameters.

Q: The Global Admin can't request stock from Headquarters.
A: The system requires the Global Admin to set a physical location via the Set as Main button in the Admin Settings. Without a physical location, the system prevents transfers, as "Headquarters" typically represents the software instance, not a physical warehouse, unless explicitly named so in the branches array.
