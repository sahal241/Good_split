"use client";
import { useEffect, useState } from "react";
import type { Balance, Group, Settlement } from "@/lib/types";
import {
  downloadCSVFile,
  generateClipboardSummary,
} from "@/lib/exportUtils";
import {
  formatCurrency,
  totalSpentCents,
  calculateMemberTotals,
} from "@/lib/calculations";
import { formatDate } from "@/lib/utils";

interface Props {
  group: Group;
  balances: Balance[];
  settlements: Settlement[];
  onClose: () => void;
}

export default function ExportModal({
  group,
  balances,
  settlements,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);
  const total = totalSpentCents(group.expenses);
  const memberTotals = calculateMemberTotals(group.members, group.expenses);
  const memberMap = Object.fromEntries(group.members.map((m) => [m.id, m.name]));
  const sortedExpenses = [...group.expenses].sort((a, b) => b.date.localeCompare(a.date));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleDownloadCSV() {
    downloadCSVFile(group, balances, settlements);
  }

  function handlePrintPDF() {
    window.print();
  }

  async function handleCopySummary() {
    const text = generateClipboardSummary(group, balances, settlements);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }

  return (
    <>
      {/* Interactive Modal (hidden during print) */}
      <div
        className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 py-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2D6C8] w-full max-w-2xl my-auto p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2D6C8] shrink-0">
            <div>
              <h2 id="export-modal-title" className="text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
                <span>📥</span>
                <span>Export &amp; Download</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Download the expense ledger, generate a printable PDF report, or copy a chat summary.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAF5ED] p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Export Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 shrink-0">
            {/* 1. CSV / Excel */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#E2D6C8] bg-[#FAF5ED] hover:bg-[#E6F3F1] hover:border-[#2D7D6F] transition-all text-center group active:scale-[0.98]"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📊</span>
              <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2D7D6F]">
                Download CSV (Excel)
              </span>
              <span className="text-[11px] text-[#6B7280] mt-0.5">
                Full spreadsheet ledger
              </span>
            </button>

            {/* 2. Printable PDF */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#E2D6C8] bg-[#FAF5ED] hover:bg-[#E6F3F1] hover:border-[#2D7D6F] transition-all text-center group active:scale-[0.98]"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🖨️</span>
              <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2D7D6F]">
                Print / Save as PDF
              </span>
              <span className="text-[11px] text-[#6B7280] mt-0.5">
                Print-ready PDF report
              </span>
            </button>

            {/* 3. WhatsApp / Chat Copy */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#E2D6C8] bg-[#FAF5ED] hover:bg-[#E6F3F1] hover:border-[#2D7D6F] transition-all text-center group active:scale-[0.98]"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                {copied ? "✅" : "💬"}
              </span>
              <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#2D7D6F]">
                {copied ? "Copied to Clipboard!" : "Copy Chat Summary"}
              </span>
              <span className="text-[11px] text-[#6B7280] mt-0.5">
                {copied ? "Ready to paste" : "Format for WhatsApp"}
              </span>
            </button>
          </div>

          {/* Report Live Preview Header */}
          <div className="flex flex-wrap items-center justify-between gap-1 pb-2 mb-2 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] truncate max-w-[200px] sm:max-w-none">
              Report Preview ({group.name})
            </span>
            <span className="text-[11px] text-[#6B7280] whitespace-nowrap">
              {group.expenses.length} expenses &middot; {group.members.length} members
            </span>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2D6C8] bg-[#FAF5ED] p-3 sm:p-4 text-xs space-y-4">
            {/* Overview Box */}
            <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#E2D6C8] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase font-bold">Group</p>
                <p className="text-sm font-extrabold text-[#1A1A1A] truncate">{group.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase font-bold">Total Spent</p>
                <p className="text-sm font-extrabold text-[#2D7D6F]">
                  {formatCurrency(total, group.currency, { absolute: true })}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase font-bold">Currency</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{group.currency}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] uppercase font-bold">Date</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {new Date().toISOString().split("T")[0]}
                </p>
              </div>
            </div>

            {/* Expenses Mini-Table */}
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1.5 uppercase text-[11px] tracking-wider">
                Expenses ({sortedExpenses.length})
              </p>
              {sortedExpenses.length === 0 ? (
                <p className="text-[#6B7280] italic">No expenses logged yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-[#E2D6C8] bg-[#FFFFFF]">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#FAF5ED] border-b border-[#E2D6C8] text-[#6B7280] font-semibold">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Paid By</th>
                        <th className="p-2">Split Method</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2D6C8]">
                      {sortedExpenses.map((e) => {
                        const mode = e.splitMode ?? "equal";
                        return (
                          <tr key={e.id}>
                            <td className="p-2 whitespace-nowrap text-[#6B7280]">{formatDate(e.date)}</td>
                            <td className="p-2 font-medium text-[#1A1A1A]">{e.description}</td>
                            <td className="p-2 text-[#6B7280]">{memberMap[e.payerId] ?? "Unknown"}</td>
                            <td className="p-2 text-[#6B7280]">
                              {mode === "exact" ? (
                                <span className="font-semibold text-[#2D7D6F]">Exact</span>
                              ) : mode === "percentage" ? (
                                <span className="font-semibold text-[#1A1A1A]">Percentage</span>
                              ) : mode === "shares" ? (
                                <span className="font-semibold text-[#2D7D6F]">Shares</span>
                              ) : (
                                "Equal"
                              )}
                            </td>
                            <td className="p-2 text-right font-bold text-[#1A1A1A]">
                              {formatCurrency(e.amountCents, group.currency, { absolute: true })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Balances Mini-Table */}
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1.5 uppercase text-[11px] tracking-wider">
                Member Balances &amp; Breakdown
              </p>
              <div className="overflow-x-auto rounded-lg border border-[#E2D6C8] bg-[#FFFFFF]">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FAF5ED] border-b border-[#E2D6C8] text-[#6B7280] font-semibold">
                    <tr>
                      <th className="p-2">Member</th>
                      <th className="p-2 text-right">Paid</th>
                      <th className="p-2 text-right">Share</th>
                      <th className="p-2 text-right">Net Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D6C8]">
                    {memberTotals.map((m) => {
                      const isPositive = m.netCents > 0;
                      const isNegative = m.netCents < 0;
                      return (
                        <tr key={m.memberId}>
                          <td className="p-2 font-semibold text-[#1A1A1A]">{m.memberName}</td>
                          <td className="p-2 text-right text-[#6B7280]">
                            {formatCurrency(m.paidCents, group.currency, { absolute: true })}
                          </td>
                          <td className="p-2 text-right text-[#6B7280]">
                            {formatCurrency(m.shareCents, group.currency, { absolute: true })}
                          </td>
                          <td
                            className={`p-2 text-right font-bold ${
                              isPositive
                                ? "text-[#1A7F4E]"
                                : isNegative
                                ? "text-[#C0392B]"
                                : "text-[#6B7280]"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {formatCurrency(m.netCents, group.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Settlement Plan */}
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1.5 uppercase text-[11px] tracking-wider">
                Settlement Actions
              </p>
              {settlements.length === 0 ? (
                <p className="text-[#1A7F4E] font-medium bg-[#FFFFFF] p-2 rounded border border-[#E2D6C8]">
                  🎉 All members are settled up! No payments needed.
                </p>
              ) : (
                <ul className="space-y-1.5 bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E2D6C8]">
                  {settlements.map((s, idx) => (
                    <li key={idx} className="flex items-center justify-between py-0.5">
                      <span className="text-[#1A1A1A]">
                        <strong>{s.fromName}</strong> pays <strong>{s.toName}</strong>
                      </span>
                      <span className="font-bold text-[#2D7D6F]">
                        {formatCurrency(s.amountCents, group.currency, { absolute: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3.5 border-t border-[#E2D6C8] mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            <span className="text-[11px] text-[#6B7280] text-center sm:text-left">
              CSV opens directly in Microsoft Excel, Google Sheets, or Apple Numbers.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl border border-[#E2D6C8] text-[#1A1A1A] text-xs font-semibold hover:bg-[#FAF5ED] transition-colors cursor-pointer text-center"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Clean Printable Report (Visible ONLY when printing / Save as PDF) */}
      <div id="print-statement" className="hidden print:block p-8 bg-white text-black font-sans">
        {/* Print Header */}
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">GoodSplit Expense Report</h1>
            <p className="text-sm font-bold text-gray-700">Group: {group.name}</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Export Date: {new Date().toLocaleDateString()}</p>
            <p>Currency: {group.currency}</p>
            <p className="font-bold text-black text-sm mt-1">
              Total Spent: {formatCurrency(total, group.currency, { absolute: true })}
            </p>
          </div>
        </div>

        {/* 1. Settlement Plan Summary Box */}
        <div className="mb-6 border border-gray-300 p-4 rounded-lg bg-gray-50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2 border-b border-gray-300 pb-1">
            Settlement Plan (Minimized Payments)
          </h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-green-700 font-bold">All members are fully settled up! No payments required.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {settlements.map((s, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-gray-200">
                  <span>
                    <strong>{s.fromName}</strong> pays <strong>{s.toName}</strong>
                  </span>
                  <span className="font-bold text-black">
                    {formatCurrency(s.amountCents, group.currency, { absolute: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Member Balances Table */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">Member Balances</h2>
          <table className="w-full text-left text-xs border border-gray-300">
            <thead className="bg-gray-100 border-b border-gray-300 font-bold">
              <tr>
                <th className="p-2 border-r border-gray-300">Member</th>
                <th className="p-2 text-right border-r border-gray-300">Total Paid</th>
                <th className="p-2 text-right border-r border-gray-300">Total Share</th>
                <th className="p-2 text-right border-r border-gray-300">Net Balance</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {memberTotals.map((m) => {
                const isPositive = m.netCents > 0;
                const isNegative = m.netCents < 0;
                return (
                  <tr key={m.memberId}>
                    <td className="p-2 font-bold border-r border-gray-300">{m.memberName}</td>
                    <td className="p-2 text-right border-r border-gray-300">
                      {formatCurrency(m.paidCents, group.currency, { absolute: true })}
                    </td>
                    <td className="p-2 text-right border-r border-gray-300">
                      {formatCurrency(m.shareCents, group.currency, { absolute: true })}
                    </td>
                    <td className="p-2 text-right font-bold border-r border-gray-300">
                      {isPositive ? "+" : ""}
                      {formatCurrency(m.netCents, group.currency)}
                    </td>
                    <td className="p-2 font-semibold">
                      {isPositive ? "Gets back" : isNegative ? "Owes" : "Settled"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. Expense Ledger Table */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-2">
            Expense Ledger ({sortedExpenses.length} Records)
          </h2>
          <table className="w-full text-left text-xs border border-gray-300">
            <thead className="bg-gray-100 border-b border-gray-300 font-bold">
              <tr>
                <th className="p-2 border-r border-gray-300">Date</th>
                <th className="p-2 border-r border-gray-300">Description</th>
                <th className="p-2 border-r border-gray-300">Paid By</th>
                <th className="p-2 text-right border-r border-gray-300">Total</th>
                <th className="p-2 border-r border-gray-300">Split With</th>
                <th className="p-2 text-right">Per Person</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {sortedExpenses.map((exp) => {
                const payer = memberMap[exp.payerId] ?? "Unknown";
                const mode = exp.splitMode ?? "equal";
                let splitNames = "";
                let perPersonText = "";

                if (mode === "exact" && exp.splitDetails) {
                  splitNames = exp.splitBetween
                    .map((id) => `${memberMap[id] ?? "Unknown"} (${formatCurrency(exp.splitDetails?.[id] ?? 0, group.currency, { absolute: true })})`)
                    .join(", ");
                  perPersonText = "Exact";
                } else if (mode === "percentage" && exp.splitDetails) {
                  splitNames = exp.splitBetween
                    .map((id) => `${memberMap[id] ?? "Unknown"} (${exp.splitDetails?.[id]}%)`)
                    .join(", ");
                  perPersonText = "Percentage";
                } else if (mode === "shares" && exp.splitDetails) {
                  splitNames = exp.splitBetween
                    .map((id) => `${memberMap[id] ?? "Unknown"} (${exp.splitDetails?.[id]} shares)`)
                    .join(", ");
                  perPersonText = "Shares";
                } else {
                  splitNames = exp.splitBetween.map((id) => memberMap[id] ?? "Unknown").join(", ");
                  const perPerson =
                    exp.splitBetween.length > 0 ? Math.floor(exp.amountCents / exp.splitBetween.length) : exp.amountCents;
                  perPersonText = formatCurrency(perPerson, group.currency, { absolute: true });
                }

                return (
                  <tr key={exp.id}>
                    <td className="p-2 border-r border-gray-300 whitespace-nowrap">{formatDate(exp.date)}</td>
                    <td className="p-2 font-semibold border-r border-gray-300">{exp.description}</td>
                    <td className="p-2 border-r border-gray-300">{payer}</td>
                    <td className="p-2 text-right font-bold border-r border-gray-300">
                      {formatCurrency(exp.amountCents, group.currency, { absolute: true })}
                    </td>
                    <td className="p-2 border-r border-gray-300 max-w-xs">{splitNames}</td>
                    <td className="p-2 text-right">{perPersonText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          GoodSplit — Split expenses, not friendships &middot; Generated on {new Date().toLocaleString()}
        </div>
      </div>
    </>
  );
}
