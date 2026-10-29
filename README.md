# GoodSplit 👥

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2D8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A calm, aesthetic group expense-splitting web app with greedy debt minimization, flexible splits, offline PWA support, and interactive spotlight aesthetics.**

[Explore Features](#-features) • [Quick Start](#-quick-start) • [Math & Calculations](#-smart-calculations--debt-minimization) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### 🎨 Aesthetic & Thoughtful Design
- **Warm Linen Aesthetic**: Custom Warm Linen (`#F3ECE1`) background with soft borders (`#E2D6C8`) and clean card surfaces.
- **Plus Jakarta Sans Typography**: Modern, balanced headings with clear legible body copy.
- **Interactive Spotlight Cards**: Dynamic mouse-tracking radial illumination across summary cards (`Total Spending`, `You Owe`, `Owed to You`).
- **Dramatic Spotlight Modal**: Translucent studio spotlight backdrop revealing the underlying dashboard while illuminating the Add Expense card on a platform stage.
- **Animated Shiny Buttons**: Smooth looping shimmer and spring physics powered by Framer Motion.

### 👥 Group Setup & Member Management
- **Custom Group Setup**: Name your trip, home, or event (e.g. *"Goa Getaway"*, *"Flat 302"*, *"Office Lunch"*).
- **Multi-Currency**: Instant toggle between **INR (₹)**, **USD ($)**, and **EUR (€)** with automatic formatting.
- **Dynamic Membership**: Add members on the fly or remove members with safe share redistribution.
- **Safeguard Protections**: Minimum 2-member group enforcement to maintain mathematical integrity.

### 💸 Flexible Split Modes (Beyond Equal Split)
- **= Equal Split**: Automatic division with exact-penny remainder distribution (no one pays more than 1 cent difference).
- **Exact Amounts**: Allocate specific currency sums per member with real-time remaining balance tracker and 1-click `+ Fill Remainder` helper.
- **% Percentages**: Split by custom percentages (e.g., 60% / 40%) with live 100% sum verification.
- **⚖️ Shares / Ratios**: Weighted splitting (e.g., 2 shares for couples, 1 share for individuals) with live fractional breakdown.

### 🧮 Smart Settlement & Debt Minimization
- **Greedy Simplification Algorithm**: Consolidates complex multi-party debts into the absolute minimum number of payments (e.g., 6 friends settling in just 2-3 payments).
- **Live Net Balances**: Instant color-coded badges for surplus (+), debt (-), and settled states.

### 📱 Progressive Web App (PWA) & Offline-First
- **Zero Server Dependency**: 100% client-side persistence in browser `localStorage`.
- **Works Fully Offline**: Custom service worker caches assets, fonts, and application shell.
- **Installable**: One-tap installation to home screen on iOS (Safari) and Android (Chrome).

### 📊 Export & Reports Center
- **Excel / CSV Export**: Includes UTF-8 Byte Order Mark (`\uFEFF`) ensuring currency symbols (`₹`, `$`, `€`) display without corruption in Excel, Numbers, and Google Sheets.
- **Print / PDF Summary**: Tailored print stylesheet for clean, printable financial statements.
- **WhatsApp / Chat Share**: Formatted markdown settlement summaries ready to paste directly into chat groups.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack) |
| **Library** | [React 19.3](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) & Lucide React Icons |
| **Storage** | Client-side `localStorage` with Service Worker offline caching |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/sahal241/Good_split.git
cd Good_split
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 📐 Project Architecture

```
Good_split/
├── app/
│   ├── globals.css         # Tailwind v4 theme, fonts, and custom utilities
│   ├── layout.tsx          # Root layout with Plus Jakarta Sans & Inter fonts
│   └── page.tsx            # Main application entry point
├── components/
│   ├── ui/
│   │   ├── shiny-button.tsx    # Framer Motion animated shiny button
│   │   └── spotlight-card.tsx  # Mouse-tracking interactive glow card
│   ├── ConfirmDialog.tsx       # Accessible modal for destructive actions
│   ├── Dashboard.tsx           # State orchestrator & layout manager
│   ├── ExpenseForm.tsx         # Add/edit expense with spotlight backdrop & split modes
│   ├── ExpenseList.tsx         # Expense ledger with inline edit/delete actions
│   ├── ExportModal.tsx         # CSV download, PDF print, and WhatsApp copy
│   ├── GroupHeader.tsx         # Centered title, member tags & currency selector
│   ├── GroupSetup.tsx          # First-time onboarding wizard
│   ├── MemberBalances.tsx      # Member balances & add-member form
│   ├── PWAInstaller.tsx        # Service worker registration & install banner
│   ├── RemoveMemberModal.tsx   # Confirmation dialog for removing members
│   ├── SettlementPlan.tsx      # Minimized settlement route recommendations
│   └── SummaryCards.tsx        # Spending, debt, and credit overview cards
├── lib/
│   ├── calculations.ts     # Debt-minimization algorithm & cent splitting
│   ├── exportUtils.ts      # CSV generation, Excel BOM & chat formatting
│   ├── storage.ts          # Safe localStorage read/write helpers
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Formatting & ID generators
├── public/
│   ├── Referance.jpg       # Spotlight studio backdrop
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline caching
│   └── ...icons
├── README.md
└── package.json
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)
1. Fork or clone this repository.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Select **`Good_split`** and click **Import**.
4. Click **Deploy** — zero extra environment variables or configurations required!

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
