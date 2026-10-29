# GoodSplit 👥

**GoodSplit** is a polished, responsive group expense-splitting web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It is designed with a warm neutral palette, calm teal accents, and zero external dependencies—persisting all data directly in the browser's `localStorage`.

---

## ✨ Features

- **Custom Group Setup**:
  - Enter your custom **Team / Group Name** (e.g. *"Goa Trip"*, *"Apartment 302"*, *"Office Lunch"*).
  - Select your currency: **INR (₹)**, **USD ($)**, or **EUR (€)**.
  - Choose the **number of members** (from 2 up to 20) with quick count steppers or fine-grained counter buttons.
  - Name each member (e.g., *"You"*, *"Sam"*, *"Alex"*...).
- **Dynamic Member Management (Add & Remove Members)**:
  - **Add Members**: Add new friends or teammates on the fly directly from the dashboard without resetting your group.
  - **Remove Members**: Remove members via either the member pills in the group header (`✕`) or the trash icon in the Member Balances card.
  - **Smart Impact Confirmation**: Transparent modal displaying the member's current net balance and warning how their removal impacts existing expenses (deleting expenses they paid for and redistributing split shares evenly among remaining members).
  - **Minimum 2-Member Safeguard**: Ensures a group always retains at least 2 members to preserve fair expense splitting.
- **Add, Edit & Delete Expenses**:
  - Full modal dialog with keyboard accessibility (`Esc` to close).
  - Fields for description, amount, date, payer, and multi-member split checkboxes.
  - Live split preview (e.g. `💡 ~₹25.00 / person`).
  - Confirmation dialog before deleting expenses to prevent accidental data loss.
- **Flexible Split Modes (Beyond Equal Split)**:
  - **= Equal Split**: Divide costs evenly among selected participants with exact-penny remainder distribution.
  - **Exact Amounts**: Specify exact currency amounts per member (e.g., You owe $30, Sam owes $70) with a live remaining balance tracker and 1-click `+ Fill Remainder` helper.
  - **% Percentages**: Split by custom percentages (e.g., 60% / 40%) with real-time percentage validation and `+ Fill` helper.
  - **⚖️ Shares / Ratios**: Allocate weights or shares (e.g., 2 shares for a couple, 1 share for a single friend) with live share fraction and equivalent cost display.
- **Accurate Cents Splitting**:
  - Even division with exact penny handling when amounts do not divide evenly (remainders are distributed 1 cent per member so no one pays more than 1 cent difference, and total debits match total credits down to the penny).
- **Comprehensive Dashboard**:
  - **Total Group Spending** metric card.
  - **You Owe** and **Owed to You** status cards.
  - **Member Balances** with color-coded positive, negative, and settled states.
  - **Settlement Plan**: Greedy debt-minimization algorithm generating clean settlement actions (e.g., *"Sam pays You ₹12.50"*).
- **Reset Group**:
  - Dedicated **"Reset Group"** button with a safety confirmation modal.
  - Completely wipes local storage and restarts the setup wizard so you can start a fresh group anytime.
- **Export & Download Center**:
  - **Excel / CSV Download**: Full spreadsheet export containing Group Overview, Expense Ledger, Member Balances, and Minimized Settlement Actions. Includes UTF-8 Byte Order Mark (`\uFEFF`) ensuring currency symbols (`₹`, `$`, `€`) display accurately in Microsoft Excel, Apple Numbers, and Google Sheets.
  - **Print / Save as PDF**: Direct browser print-to-PDF statement styled with dedicated print media queries, hiding interactive UI elements and rendering an executive financial summary.
  - **WhatsApp / Chat Summary**: One-click copy formatted with emojis, clean markdown, and settlement actions ready to paste into any chat or messaging app.
- **Progressive Web App (PWA) & Offline Mode**:
  - **Install to Home Screen**: Install GoodSplit like a native app on iOS (Safari) and Android (Chrome/Edge).
  - **Full Offline Functionality**: Uses a custom Service Worker to cache app shell, assets, and icons. All expenses and groups persist in `localStorage`, so the app works seamlessly even without an internet connection.
  - **Native Look & Feel**: Standalone display mode, custom theme color (`#2D7D6F`), launch splash background (`#FAF7F2`), and tailored 192x192, 512x512, maskable, and Apple touch icons.
  - **Smart Install Banner**: In-app prompt with automatic detection and guided instructions for iOS Safari users.
- **Responsive & Accessible**: Optimized for mobile phones, tablets, and desktops with accessible ARIA tags, labels, and keyboard navigation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` tokens
- **Persistence**: Browser `localStorage` (No server, database, or API keys required)

---

## 🚀 Quick Start / Local Development

### Prerequisites

- Node.js 18.18.0 or higher
- npm (or yarn / pnpm)

### Steps

1. **Clone or navigate to the repository:**
   ```bash
   cd Good_split
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🚢 Deploying to Vercel

GoodSplit is frontend-only and ready for instant deployment to [Vercel](https://vercel.com).

### Option 1: Via Vercel Dashboard (Git)

1. Push your repository to GitHub, GitLab, or Bitbucket:
   ```bash
   git add .
   git commit -m "feat: custom group setup, accurate cents splitting, and reset functionality"
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
3. Import your `Good_split` repository.
4. Framework preset will automatically detect **Next.js**.
5. Keep default build command (`next build`) and output directory (`.next`).
6. Click **Deploy**.

### Option 2: Via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run deploy in the project directory:
   ```bash
   vercel
   ```
3. For production deployment:
   ```bash
   vercel --prod
   ```

---

## 📂 Project Architecture

```
Good_split/
├── app/
│   ├── globals.css         # Tailwind v4 theme definitions and base styles
│   ├── layout.tsx          # Root HTML layout with Inter font and viewport configuration
│   └── page.tsx            # Main application entry point
├── components/
│   ├── ConfirmDialog.tsx   # Accessible modal for deletion and reset confirmation
│   ├── Dashboard.tsx       # Core orchestrator managing state, local storage & layout
│   ├── ExpenseForm.tsx     # Add / edit expense modal with validation
│   ├── ExpenseList.tsx     # List of expenses with edit/delete triggers
│   ├── ExportModal.tsx     # Modal for Excel/CSV download, print to PDF, and chat summary
│   ├── GroupHeader.tsx     # Group title editing, member pills & currency selector
│   ├── GroupSetup.tsx      # Team name, currency, member count & names setup wizard
│   ├── MemberBalances.tsx  # Member balance list and inline add-member form
│   ├── PWAInstaller.tsx    # Service worker registration & install prompt banner
│   ├── RemoveMemberModal.tsx # Confirmation modal for removing members with expense recalculation
│   ├── SettlementPlan.tsx  # Minimized settlement suggestions
│   └── SummaryCards.tsx    # Total spending, You owe & Owed to you cards
├── lib/
│   ├── calculations.ts     # Balance math, cent splitting, greedy settlement & currency formatting
│   ├── exportUtils.ts      # CSV generation, Excel UTF-8 BOM, file download & clipboard formatting
│   ├── storage.ts          # Safe localStorage read/write/clear helpers
│   ├── types.ts            # TypeScript interfaces (Group, Member, Expense, Balance, Settlement)
│   └── utils.ts            # Date formatting and unique ID generation
├── README.md               # Project documentation and setup guide
└── package.json
```
