"use client";
import { useState } from "react";
import type { Currency, Group, Member } from "@/lib/types";

interface Props {
  group: Group;
  onCurrencyChange: (c: Currency) => void;
  onGroupNameChange: (name: string) => void;
  onRemoveMember?: (member: Member) => void;
}

const CURRENCIES: Currency[] = ["INR", "USD", "EUR"];
const CURRENCY_LABELS: Record<Currency, string> = {
  INR: "INR (₹)",
  USD: "USD ($)",
  EUR: "EUR (€)",
};

export default function GroupHeader({
  group,
  onCurrencyChange,
  onGroupNameChange,
  onRemoveMember,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(group.name);

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (trimmed) {
      onGroupNameChange(trimmed);
    } else {
      setTempName(group.name);
    }
    setIsEditingName(false);
  }

  return (
    <header className="relative mb-6 sm:mb-8 pt-1">
      {/* Top-Right: Currency Selector */}
      <div className="sm:absolute sm:top-0 sm:right-0 flex items-center justify-end gap-2 mb-3 sm:mb-0 z-10">
        <label htmlFor="currency-select" className="text-xs font-semibold text-[#6B7280]">
          Currency:
        </label>
        <div className="relative">
          <select
            id="currency-select"
            value={group.currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="appearance-none pl-3.5 pr-8 py-1.5 sm:py-2 rounded-xl border border-[#E2D6C8] bg-[#FFFFFF] text-xs sm:text-sm font-semibold text-[#1A1A1A] hover:border-[#2D7D6F] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/30 shadow-xs cursor-pointer transition-all"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B7280]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Centered: Group Title & Info */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto px-2">
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center justify-center gap-2 mb-2 max-w-md w-full">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              className="text-xl sm:text-2xl font-bold text-center text-[#1A1A1A] bg-[#FFFFFF] px-3 py-1 border border-[#2D7D6F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/30 w-full font-heading"
              placeholder="Group name"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-[#2D7D6F] text-white rounded-lg hover:bg-[#1F5C52] transition-colors shrink-0"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setTempName(group.name);
                setIsEditingName(false);
              }}
              className="px-2.5 py-1.5 text-xs text-[#6B7280] hover:text-[#1A1A1A] rounded-lg transition-colors shrink-0"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2.5 group/title mb-2 min-w-0">
            <span className="text-xl sm:text-2xl select-none shrink-0" role="img" aria-label="Team">
              👥
            </span>
            <h1 className="text-2xl sm:text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight truncate font-heading">
              {group.name}
            </h1>
            <button
              onClick={() => {
                setTempName(group.name);
                setIsEditingName(true);
              }}
              aria-label="Rename group"
              className="text-[#6B7280] hover:text-[#2D7D6F] opacity-70 hover:opacity-100 p-1 rounded-md transition-all text-xs cursor-pointer shrink-0"
              title="Rename group"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        )}

        {/* Member avatar chips preview - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#6B7280]">
          <span className="font-medium text-[#1A1A1A]">
            {group.members.length} {group.members.length === 1 ? "member" : "members"}:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {group.members.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E2D6C8] text-[#1A1A1A] text-xs font-medium shadow-2xs group/chip"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D7D6F]" />
                <span>{m.name}</span>
                {onRemoveMember && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m)}
                    aria-label={`Remove ${m.name} from group`}
                    title={`Remove ${m.name}`}
                    className="text-[#6B7280] hover:text-[#C0392B] hover:bg-[#FAF5ED] rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
