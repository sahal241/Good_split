"use client";
import { useState } from "react";
import { formatCurrency } from "@/lib/calculations";
import type { Balance, Member } from "@/lib/types";

interface Props {
  balances: Balance[];
  currency: string;
  onAddMember: (name: string) => void;
  onRemoveMember?: (member: Member) => void;
}

export default function MemberBalances({
  balances,
  currency,
  onAddMember,
  onRemoveMember,
}: Props) {
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    const already = balances.some(
      (b) => b.memberName.toLowerCase() === trimmed.toLowerCase()
    );
    if (already) {
      setError(`"${trimmed}" is already in the group.`);
      return;
    }
    setError(null);
    onAddMember(trimmed);
    setNameInput("");
  }

  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E2D6C8] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
          Member Balances
        </h2>
        <span className="text-xs text-[#6B7280] font-medium">
          {balances.length} {balances.length === 1 ? "person" : "people"}
        </span>
      </div>

      {balances.length === 0 ? (
        <div className="text-center py-6 text-[#6B7280] text-sm">
          <p>No members yet.</p>
          <p className="text-xs mt-1">Add members using the input below.</p>
        </div>
      ) : (
        <ul className="space-y-3 mb-5 divide-y divide-[#E2D6C8]/40">
          {balances.map((b) => {
            const isPositive = b.netCents > 0;
            const isNegative = b.netCents < 0;
            const isYou = b.memberId === "you" || b.memberName.toLowerCase() === "you";

            return (
              <li
                key={b.memberId}
                className="flex items-center justify-between pt-2.5 first:pt-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isYou
                        ? "bg-[#2D7D6F] text-white"
                        : "bg-[#E6F3F1] text-[#2D7D6F]"
                    }`}
                  >
                    {b.memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate flex items-center gap-1.5">
                      <span>{b.memberName}</span>
                      {isYou && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#FAF5ED] text-[#6B7280] border border-[#E2D6C8]">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {isPositive
                        ? "gets back"
                        : isNegative
                        ? "owes in total"
                        : "fully settled"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 pl-3">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isPositive
                          ? "text-[#1A7F4E]"
                          : isNegative
                          ? "text-[#C0392B]"
                          : "text-[#6B7280]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(b.netCents, currency)}
                    </span>
                  </div>
                  {onRemoveMember && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember({ id: b.memberId, name: b.memberName })}
                      aria-label={`Remove ${b.memberName} from group`}
                      title={`Remove ${b.memberName} from group`}
                      className="p-1 text-[#6B7280] hover:text-[#C0392B] rounded-lg hover:bg-[#FAF5ED] transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add member form */}
      <form onSubmit={handleSubmit} className="mt-2">
        <label htmlFor="new-member-input" className="sr-only">
          Add new member
        </label>
        <div className="flex gap-2">
          <input
            id="new-member-input"
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Add new member…"
            maxLength={30}
            className={`flex-1 min-w-0 px-3 py-2 rounded-xl border text-xs sm:text-sm bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all ${
              error ? "border-[#C0392B]" : "border-[#E2D6C8]"
            }`}
          />
          <button
            type="submit"
            className="shrink-0 px-3.5 py-2 rounded-xl bg-[#2D7D6F] text-white text-xs sm:text-sm font-semibold hover:bg-[#1F5C52] active:scale-[0.98] transition-all shadow-xs"
          >
            Add
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-[#C0392B] mt-1.5 font-medium">{error}</p>
        )}
      </form>
    </div>
  );
}
