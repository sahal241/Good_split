"use client";
import { useEffect, useState } from "react";
import type { Currency, Expense, Group, Member } from "@/lib/types";
import { loadGroup, saveGroup, clearGroup } from "@/lib/storage";
import {
  calculateBalances,
  calculateSettlements,
  totalSpentCents,
} from "@/lib/calculations";
import { generateId } from "@/lib/utils";
import GroupSetup from "./GroupSetup";
import GroupHeader from "./GroupHeader";
import SummaryCards from "./SummaryCards";
import MemberBalances from "./MemberBalances";
import SettlementPlan from "./SettlementPlan";
import ExpenseList from "./ExpenseList";
import ExpenseForm from "./ExpenseForm";
import ExportModal from "./ExportModal";
import RemoveMemberModal from "./RemoveMemberModal";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [group, setGroup] = useState<Group | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  useEffect(() => {
    const loaded = loadGroup();
    setGroup(loaded);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && group) {
      saveGroup(group);
    }
  }, [group, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2D7D6F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6B7280] text-sm font-medium">Loading GoodSplit…</p>
        </div>
      </div>
    );
  }

  // If no group is configured, show the initial setup flow
  if (!group) {
    return (
      <GroupSetup
        onCreateGroup={(newGroup) => {
          setGroup(newGroup);
          saveGroup(newGroup);
        }}
      />
    );
  }

  const youId =
    group.members.find((m) => m.name.toLowerCase() === "you")?.id ??
    group.members[0]?.id ??
    "you";

  const balances = calculateBalances(group.members, group.expenses);
  const settlements = calculateSettlements(balances);
  const total = totalSpentCents(group.expenses);

  function handleAddMember(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setGroup((prev) => {
      if (!prev) return prev;
      const already = prev.members.some(
        (m) => m.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (already) return prev;
      return {
        ...prev,
        members: [...prev.members, { id: generateId(), name: trimmed }],
      };
    });
  }

  function handleConfirmRemoveMember() {
    if (!memberToRemove) return;
    const targetId = memberToRemove.id;

    setGroup((prev) => {
      if (!prev || prev.members.length <= 2) return prev;

      const nextMembers = prev.members.filter((m) => m.id !== targetId);

      // Clean expenses:
      // 1. Delete any expense paid by this member
      // 2. In remaining expenses, remove this member from splitBetween
      // 3. Drop any expense if splitBetween becomes empty
      const nextExpenses = prev.expenses
        .filter((e) => e.payerId !== targetId)
        .map((e) => ({
          ...e,
          splitBetween: e.splitBetween.filter((id) => id !== targetId),
        }))
        .filter((e) => e.splitBetween.length > 0);

      return {
        ...prev,
        members: nextMembers,
        expenses: nextExpenses,
      };
    });

    setMemberToRemove(null);
  }

  function handleSaveExpense(expense: Expense) {
    setGroup((prev) => {
      if (!prev) return prev;
      const exists = prev.expenses.some((e) => e.id === expense.id);
      const expenses = exists
        ? prev.expenses.map((e) => (e.id === expense.id ? expense : e))
        : [expense, ...prev.expenses];
      return { ...prev, expenses };
    });
    setShowForm(false);
    setEditingExpense(undefined);
  }

  function handleDeleteExpense(id: string) {
    setGroup((prev) =>
      prev ? { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) } : prev
    );
  }

  function handleEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setShowForm(true);
  }

  function handleAddExpense() {
    setEditingExpense(undefined);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingExpense(undefined);
  }

  function handleCurrencyChange(currency: Currency) {
    setGroup((prev) => (prev ? { ...prev, currency } : prev));
  }

  function handleGroupNameChange(name: string) {
    setGroup((prev) => (prev ? { ...prev, name } : prev));
  }

  function handleConfirmReset() {
    clearGroup();
    setGroup(null);
    setShowResetConfirm(false);
  }

  return (
    <div className="min-h-screen bg-[#F3ECE1] text-[#1A1A1A] flex flex-col selection:bg-[#2D7D6F]/20 selection:text-[#1F5C52]">
      {/* Top Navigation */}
      <nav className="w-full bg-[#FFFFFF]/85 backdrop-blur-md border-b border-[#E2D6C8] sticky top-0 z-30 transition-all">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2D7D6F] flex items-center justify-center text-white shadow-sm font-bold text-sm sm:text-lg select-none font-heading">
              GS
            </div>
            <div>
              <span className="font-extrabold text-[#1A1A1A] text-base sm:text-lg tracking-tight font-heading">
                Good<span className="text-[#2D7D6F]">Split</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-[#E6F3F1] text-[#2D7D6F] font-semibold">
                Local-only
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="text-xs text-[#2D7D6F] hover:text-white hover:bg-[#2D7D6F] px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#2D7D6F]/30 hover:border-[#2D7D6F] transition-all font-semibold whitespace-nowrap active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Download group expenses as CSV or PDF report"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-[#C0392B] hover:text-white hover:bg-[#C0392B] px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#C0392B]/30 hover:border-[#C0392B] transition-all font-semibold whitespace-nowrap active:scale-95 cursor-pointer"
              title="Clear group data and start a new group"
            >
              <span>Reset</span>
              <span className="hidden sm:inline"> Group</span>
            </button>
            <ShinyButton
              onClick={handleAddExpense}
              className="bg-[#2D7D6F] text-white hover:bg-[#1F5C52] border border-[#2D7D6F]/40 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/50 whitespace-nowrap cursor-pointer transition-all"
            >
              <span className="flex items-center gap-1 sm:gap-1.5 text-white font-semibold capitalize tracking-normal">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" />
                <span>Add<span className="hidden sm:inline"> Expense</span></span>
              </span>
            </ShinyButton>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Group Header */}
        <GroupHeader
          group={group}
          onCurrencyChange={handleCurrencyChange}
          onGroupNameChange={handleGroupNameChange}
          onRemoveMember={(m) => setMemberToRemove(m)}
        />

        {/* Summary Metric Cards */}
        <SummaryCards
          totalCents={total}
          currency={group.currency}
          balances={balances}
          youId={youId}
        />

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Expenses List (2 columns on large screen) */}
          <div className="lg:col-span-2 space-y-6">
            <ExpenseList
              expenses={group.expenses}
              members={group.members}
              currency={group.currency}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onAddExpense={handleAddExpense}
              onExport={() => setShowExportModal(true)}
            />
          </div>

          {/* Sidebar: Balances & Settlement Suggestions (1 column) */}
          <div className="space-y-6">
            <MemberBalances
              balances={balances}
              currency={group.currency}
              onAddMember={handleAddMember}
              onRemoveMember={(m) => setMemberToRemove(m)}
            />
            <SettlementPlan
              settlements={settlements}
              currency={group.currency}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2D6C8] bg-[#FFFFFF]/50 mt-12 py-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GoodSplit &mdash; Fair &amp; calm group expense splitting</span>
          <span>Zero external servers &middot; Saved securely in your browser</span>
        </div>
      </footer>

      {/* Expense Modal (Add / Edit) */}
      {showForm && (
        <ExpenseForm
          members={group.members}
          currency={group.currency}
          expense={editingExpense}
          onSave={handleSaveExpense}
          onClose={handleCloseForm}
        />
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetConfirm(false);
          }}
        >
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2D6C8] w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
              Reset and clear group?
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] mb-5 leading-relaxed">
              This will permanently delete all expenses, members, and data for &ldquo;{group.name}&rdquo; from your browser, allowing you to create a completely new group.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#E2D6C8] text-[#1A1A1A] text-xs sm:text-sm font-semibold hover:bg-[#FAF5ED] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs sm:text-sm font-semibold hover:bg-[#A93226] transition-colors shadow-xs"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export / Download Modal */}
      {showExportModal && (
        <ExportModal
          group={group}
          balances={balances}
          settlements={settlements}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Remove Member Confirmation / Warning Modal */}
      {memberToRemove && (
        <RemoveMemberModal
          member={memberToRemove}
          group={group}
          balance={balances.find((b) => b.memberId === memberToRemove.id)}
          onConfirm={handleConfirmRemoveMember}
          onClose={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}
