"use client";
import { useEffect, useRef } from "react";
import type { Balance, Group, Member } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface Props {
  member: Member;
  group: Group;
  balance?: Balance;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RemoveMemberModal({
  member,
  group,
  balance,
  onConfirm,
  onClose,
}: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const isMinMembers = group.members.length <= 2;
  const paidExpenses = group.expenses.filter((e) => e.payerId === member.id);
  const splitExpenses = group.expenses.filter((e) => e.splitBetween.includes(member.id));
  const hasExpenses = paidExpenses.length > 0 || splitExpenses.length > 0;
  const netCents = balance?.netCents ?? 0;
  const isPositive = netCents > 0;
  const isNegative = netCents < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-member-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2D6C8] w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDECEA] text-[#C0392B] flex items-center justify-center text-lg font-bold shrink-0">
              👤
            </div>
            <div>
              <h2
                id="remove-member-title"
                className="text-base sm:text-lg font-bold text-[#1A1A1A] tracking-tight"
              >
                {isMinMembers ? "Cannot Remove Member" : `Remove "${member.name}"?`}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {isMinMembers
                  ? "Minimum 2 members required"
                  : `Group: ${group.name}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#6B7280] hover:text-[#1A1A1A] p-1.5 rounded-lg hover:bg-[#FAF5ED] transition-colors"
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

        {/* Content */}
        {isMinMembers ? (
          <div className="space-y-4 mb-6">
            <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] text-xs text-[#6B7280] leading-relaxed">
              <p className="font-semibold text-[#1A1A1A] mb-1">
                A group must have at least 2 members.
              </p>
              <p>
                To split expenses fairly, at least two participants are required. If you want to replace <strong>{member.name}</strong>, please add the new member first, then remove this one.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#2D7D6F] text-white text-xs sm:text-sm font-semibold hover:bg-[#1F5C52] transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {/* Status / Balance info */}
            {hasExpenses && (
              <div className="p-3.5 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280] font-medium">Current Net Balance:</span>
                  <span
                    className={`font-bold ${
                      isPositive
                        ? "text-[#1A7F4E]"
                        : isNegative
                        ? "text-[#C0392B]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {formatCurrency(netCents, group.currency)}
                    <span className="text-[11px] font-normal text-[#6B7280] ml-1">
                      ({isPositive ? "gets back" : isNegative ? "owes" : "settled"})
                    </span>
                  </span>
                </div>

                <div className="text-[11px] text-[#6B7280] border-t border-[#E2D6C8] pt-2 space-y-1.5">
                  <p className="font-semibold text-[#1A1A1A]">
                    Removing <strong>{member.name}</strong> will:
                  </p>
                  <ul className="space-y-1 pl-1">
                    {paidExpenses.length > 0 && (
                      <li className="flex items-start gap-1.5 text-[#C0392B]">
                        <span>&bull;</span>
                        <span>
                          <strong>Delete {paidExpenses.length}</strong> expense(s) paid by {member.name}.
                        </span>
                      </li>
                    )}
                    {splitExpenses.length > 0 && (
                      <li className="flex items-start gap-1.5 text-[#1A1A1A]">
                        <span>&bull;</span>
                        <span>
                          <strong>Remove from {splitExpenses.length}</strong> split(s). The costs will redistribute evenly among the remaining members.
                        </span>
                      </li>
                    )}
                  </ul>
                  <p className="text-[10px] text-[#6B7280] pt-1">
                    All balances and settlement payments will recalculate automatically.
                  </p>
                </div>
              </div>
            )}

            {!hasExpenses && (
              <p className="text-xs text-[#6B7280] leading-relaxed">
                <strong>{member.name}</strong> is not involved in any recorded expenses. They will be removed from the group and future expense forms.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E2D6C8] text-[#1A1A1A] text-xs sm:text-sm font-semibold hover:bg-[#FAF5ED] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-[#C0392B] text-white text-xs sm:text-sm font-semibold hover:bg-[#A93226] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
              >
                {hasExpenses ? "Remove & Update Expenses" : `Remove ${member.name}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
