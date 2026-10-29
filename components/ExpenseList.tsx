"use client";
import { useState } from "react";
import type { Expense, Member } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import ConfirmDialog from "./ConfirmDialog";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Plus } from "lucide-react";

interface Props {
  expenses: Expense[];
  members: Member[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onAddExpense: () => void;
  onExport?: () => void;
}

export default function ExpenseList({
  expenses,
  members,
  currency,
  onEdit,
  onDelete,
  onAddExpense,
  onExport,
}: Props) {
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m.name]));
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  function handleConfirmDelete() {
    if (expenseToDelete) {
      onDelete(expenseToDelete.id);
      setExpenseToDelete(null);
    }
  }

  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E2D6C8] p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-tight">
            Group Expenses
          </h2>
          <p className="text-xs text-[#6B7280]">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} logged
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] hover:border-[#2D7D6F] text-[#1A1A1A] hover:text-[#2D7D6F] text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-[0.98]"
              title="Download ledger as CSV or print PDF report"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Export</span>
            </button>
          )}
          <ShinyButton
            onClick={onAddExpense}
            className="bg-[#2D7D6F] text-white hover:bg-[#1F5C52] border border-[#2D7D6F]/40 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
          >
            <span className="flex items-center gap-1.5 text-white font-semibold capitalize tracking-normal">
              <Plus className="w-4 h-4 shrink-0 text-white" />
              <span>Add Expense</span>
            </span>
          </ShinyButton>
        </div>
      </div>

      {/* Empty State */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#E2D6C8] bg-[#FAF5ED]/50">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F3F1] text-[#2D7D6F] flex items-center justify-center text-2xl mx-auto mb-3">
            🧾
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-1">No expenses yet</h3>
          <p className="text-xs text-[#6B7280] max-w-xs mx-auto mb-4">
            Track dinner, lodging, or transport by adding your first expense.
          </p>
          <ShinyButton
            onClick={onAddExpense}
            className="bg-[#2D7D6F] text-white hover:bg-[#1F5C52] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex"
          >
            <span className="flex items-center gap-1.5 text-white font-semibold capitalize tracking-normal">
              <Plus className="w-4 h-4 text-white" />
              <span>Add First Expense</span>
            </span>
          </ShinyButton>
        </div>
      ) : (
        <ul className="divide-y divide-[#E2D6C8]">
          {sorted.map((exp) => {
            const payerName = memberMap[exp.payerId] ?? "Unknown";
            const isYouPayer = exp.payerId === "you" || payerName.toLowerCase() === "you";
            const splitCount = exp.splitBetween.length;
            const mode = exp.splitMode ?? "equal";

            let splitText = "";
            if (mode === "exact" && exp.splitDetails) {
              splitText = exp.splitBetween
                .map(
                  (id) =>
                    `${memberMap[id] ?? "Unknown"} (${formatCurrency(
                      exp.splitDetails?.[id] ?? 0,
                      currency,
                      { absolute: true }
                    )})`
                )
                .join(", ");
            } else if (mode === "percentage" && exp.splitDetails) {
              splitText = exp.splitBetween
                .map((id) => `${memberMap[id] ?? "Unknown"} (${exp.splitDetails?.[id]}%)`)
                .join(", ");
            } else if (mode === "shares" && exp.splitDetails) {
              splitText = exp.splitBetween
                .map((id) => `${memberMap[id] ?? "Unknown"} (${exp.splitDetails?.[id]}x)`)
                .join(", ");
            } else {
              splitText = exp.splitBetween
                .map((id) => memberMap[id] ?? "Unknown")
                .join(", ");
            }

            const perShareCents =
              splitCount > 0 ? Math.floor(exp.amountCents / splitCount) : exp.amountCents;

            return (
              <li
                key={exp.id}
                className="py-4 first:pt-1 last:pb-1 group/item transition-colors"
              >
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  {/* Left: Icon & Description & Meta */}
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] flex items-center justify-center flex-shrink-0 text-sm sm:text-base mt-0.5">
                      🧾
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] truncate tracking-tight">
                          {exp.description}
                        </h3>
                        {mode === "exact" && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FAF5ED] text-[#2D7D6F] border border-[#2D7D6F]/30">
                            Exact
                          </span>
                        )}
                        {mode === "percentage" && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FAF5ED] text-[#1A1A1A] border border-[#E2D6C8]">
                            %
                          </span>
                        )}
                        {mode === "shares" && (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E6F3F1] text-[#2D7D6F]">
                            Shares
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[11px] sm:text-xs text-[#6B7280]">
                        <span>
                          Paid by{" "}
                          <strong className="text-[#1A1A1A] font-semibold">
                            {payerName} {isYouPayer ? "(You)" : ""}
                          </strong>
                        </span>
                        <span>&middot;</span>
                        <span>{formatDate(exp.date)}</span>
                      </div>
                      <div className="mt-1 text-[11px] sm:text-xs text-[#6B7280] flex items-center gap-1 min-w-0">
                        <span className="font-medium text-[#1A1A1A] shrink-0">
                          {mode === "exact"
                            ? "Split (Exact):"
                            : mode === "percentage"
                            ? "Split (%):"
                            : mode === "shares"
                            ? "Split (Shares):"
                            : "Split:"}
                        </span>
                        <span className="truncate min-w-0">{splitText}</span>
                        <span className="text-[10px] sm:text-[11px] text-[#6B7280] shrink-0">
                          ({splitCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts & Actions */}
                  <div className="text-right flex-shrink-0 pl-1">
                    <div className="text-sm sm:text-lg font-extrabold text-[#1A1A1A] tracking-tight whitespace-nowrap">
                      {formatCurrency(exp.amountCents, currency, { absolute: true })}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-[#6B7280] whitespace-nowrap">
                      {mode === "exact"
                        ? "Custom amounts"
                        : mode === "percentage"
                        ? "By percentage"
                        : mode === "shares"
                        ? "By ratio / shares"
                        : `${formatCurrency(perShareCents, currency, { absolute: true })} / person`}
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                      <button
                        onClick={() => onEdit(exp)}
                        aria-label={`Edit ${exp.description}`}
                        className="text-xs text-[#6B7280] hover:text-[#2D7D6F] font-semibold transition-colors px-1 py-0.5 rounded hover:bg-[#FAF5ED]"
                      >
                        Edit
                      </button>
                      <span className="text-[#E2D6C8]">&middot;</span>
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        aria-label={`Delete ${exp.description}`}
                        className="text-xs text-[#6B7280] hover:text-[#C0392B] font-semibold transition-colors px-1 py-0.5 rounded hover:bg-[#FAF5ED]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <ConfirmDialog
          title="Delete Expense?"
          message={`Are you sure you want to delete "${expenseToDelete.description}"? Group balances and the settlement plan will recalculate immediately.`}
          confirmLabel="Delete Expense"
          onConfirm={handleConfirmDelete}
          onCancel={() => setExpenseToDelete(null)}
        />
      )}
    </div>
  );
}
