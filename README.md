# Antigravity - Premium Expense & Budget Tracker

Antigravity is a modern, production-ready personal finance tracker tailored for students and young professionals. The application helps users manage budgets, analyze trends, log transactions, and review automated AI-driven financial suggestions.

## Features

1. **Fintech Dashboard**: Real-time stats widgets (Balance, Incomes, Expenses, Savings Ratio, and overall Budget Utilization progress).
2. **Transaction Management**: Independent CRUD panels for Incomes & Expenses, complete with notes, dates, and categories.
3. **Budget Planning**: Category-level limit controls, alerting the user immediately if spending crosses 80% or 100%.
4. **Interactive Analytics**: Monthly trends, income vs expense comparison bars, category pie chart, and savings trend curves powered by **Recharts**.
5. **Ledger History & Exports**: Full query ledger table supporting searching, sorting, pagination, and instant exports to **CSV** and **PDF**.
6. **Smart AI Insights**: Dynamic rule-based recommendations highlighting high discretionary spending, savings rate comparisons, and top category flags.
7. **Customization**: Local profile management supporting avatar changes (Dicebear generation), multi-currency switching, and responsive **Dark Mode**.

---

## Tech Stack

- **Frontend**: React.js (Vite) + Tailwind CSS + Lucide Icons + Recharts + jsPDF
- **Backend**: Node.js + Express.js + Mongoose
- **Database**: MongoDB (Local Server default connection)
- **Authentication**: JWT (JSON Web Tokens) + Bcryptjs password hashing

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port `27017`

### Setup Instructions

1. **Install Dependencies**:
   From the root folder, run:
   ```bash
   npm run install-all
   ```
   This installs root orchestration tools, backend middleware, and frontend assets.

2. **Seed the Database**:
   Populate your local MongoDB with 6 months of detailed mock data so charts and insights are populated instantly on login:
   ```bash
   cd backend
   node seed.js
   ```

3. **Start Development Servers**:
   From the root folder, run:
   ```bash
   npm run dev
   ```
   This concurrently launches the Backend Express server (on `http://localhost:5001`) and the Vite React frontend (on `http://localhost:5173` or similar).

### Credentials for Demo

Use these credentials to log in and preview preloaded data:
- **Email**: `demo@example.com`
- **Password**: `Password123`

---

## Folder Layout

```
c:\Users\venka\Expense tracker\
├── backend\               # Node.js + Express API
│   ├── config\            # Database configs (mongoose db.js)
│   ├── controllers\       # Express handlers (auth, incomes, expenses, budgets, etc.)
│   ├── models\            # Mongoose Schema definitions
│   ├── routes\            # Express routers mounting API endpoints
│   ├── middleware\        # JWT verification & error handling
│   ├── utils\             # Rule-based Insights Engine (insights.js)
│   ├── seed.js            # Mock history db seeder
│   └── server.js          # API server entrance
├── frontend\              # React + Vite application
│   ├── public\            # Web icons & assets
│   ├── src\
│   │   ├── components\    # Reusable widgets (StatCard, NotificationBell, Onboarding)
│   │   ├── context\       # Global state states (Auth, Theme, Currency)
│   │   ├── pages\         # Dashboard, Incomes, Expenses, Budgets, Analytics, Profile
│   │   ├── utils\         # Axios api clients
│   │   └── App.jsx        # Routing orchestrator
│   └── tailwind.config.js
└── package.json           # Concurrent runs orchestration scripts
```
