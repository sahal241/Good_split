"use client";
import { useEffect, useRef, useState } from "react";
import type { Expense, Member, SplitMode } from "@/lib/types";
import { generateId, today } from "@/lib/utils";

interface Props {
  members: Member[];
  currency?: string;
  expense?: Expense;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

export default function ExpenseForm({
  members,
  currency = "INR",
  expense,
  onSave,
  onClose,
}: Props) {
  const isEdit = !!expense;
  const currSymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(
    expense ? (expense.amountCents / 100).toFixed(2) : ""
  );
  const [date, setDate] = useState(expense?.date || today());
  const [payerId, setPayerId] = useState(
    expense?.payerId ?? members[0]?.id ?? "you"
  );

  // Split mode state
  const [splitMode, setSplitMode] = useState<SplitMode>(
    expense?.splitMode ?? "equal"
  );

  // 1. Equal mode: selected member ids
  const [equalSplitBetween, setEqualSplitBetween] = useState<string[]>(
    expense?.splitMode === "equal" || !expense?.splitMode
      ? expense?.splitBetween ?? members.map((m) => m.id)
      : members.map((m) => m.id)
  );

  // 2. Exact mode: memberId -> string amount
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    members.forEach((m) => {
      if (expense?.splitMode === "exact" && expense.splitDetails?.[m.id] !== undefined) {
        init[m.id] = (expense.splitDetails[m.id] / 100).toFixed(2);
      } else {
        init[m.id] = "";
      }
    });
    return init;
  });

  // 3. Percentage mode: memberId -> string percent
  const [percentages, setPercentages] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    members.forEach((m) => {
      if (expense?.splitMode === "percentage" && expense.splitDetails?.[m.id] !== undefined) {
        init[m.id] = String(expense.splitDetails[m.id]);
      } else {
        init[m.id] = "";
      }
    });
    return init;
  });

  // 4. Shares mode: memberId -> number of shares
  const [shares, setShares] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    members.forEach((m) => {
      if (expense?.splitMode === "shares" && expense.splitDetails?.[m.id] !== undefined) {
        init[m.id] = expense.splitDetails[m.id];
      } else {
        init[m.id] = 1; // default 1 share per member
      }
    });
    return init;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Calculations for live preview
  const parsedAmt = parseFloat(amount);
  const totalAmountCents = isNaN(parsedAmt) ? 0 : Math.round(parsedAmt * 100);

  // Exact calculations
  const exactSumCents = Object.values(exactAmounts).reduce((acc, val) => {
    const num = parseFloat(val);
    return acc + (isNaN(num) ? 0 : Math.round(num * 100));
  }, 0);
  const exactDiffCents = totalAmountCents - exactSumCents;

  // Percentage calculations
  const percentSum = Object.values(percentages).reduce((acc, val) => {
    const num = parseFloat(val);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);
  const percentDiff = Math.round((100 - percentSum) * 100) / 100;

  // Shares calculations
  const totalShares = Object.values(shares).reduce((acc, val) => acc + (val > 0 ? val : 0), 0);

  // Equal mode handlers
  function toggleEqualMember(id: string) {
    setEqualSplitBetween((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0 && errors.split) {
        setErrors((e) => ({ ...e, split: "" }));
      }
      return next;
    });
  }

  function handleSelectAllEqual() {
    setEqualSplitBetween(members.map((m) => m.id));
    if (errors.split) setErrors((e) => ({ ...e, split: "" }));
  }

  function handleDeselectAllEqual() {
    setEqualSplitBetween([]);
  }

  // Exact mode auto-fill
  function handleAutoFillExact(memberId: string) {
    if (exactDiffCents <= 0) return;
    const currentVal = parseFloat(exactAmounts[memberId] || "0") || 0;
    const nextVal = ((currentVal * 100 + exactDiffCents) / 100).toFixed(2);
    setExactAmounts((prev) => ({ ...prev, [memberId]: nextVal }));
    if (errors.split) setErrors((e) => ({ ...e, split: "" }));
  }

  // Percentage mode auto-fill
  function handleAutoFillPercent(memberId: string) {
    if (percentDiff <= 0) return;
    const currentVal = parseFloat(percentages[memberId] || "0") || 0;
    const nextVal = String(Math.round((currentVal + percentDiff) * 100) / 100);
    setPercentages((prev) => ({ ...prev, [memberId]: nextVal }));
    if (errors.split) setErrors((e) => ({ ...e, split: "" }));
  }

  // Shares stepper handler
  function handleShareChange(memberId: string, delta: number) {
    setShares((prev) => {
      const current = prev[memberId] ?? 1;
      const next = Math.max(0, current + delta);
      return { ...prev, [memberId]: next };
    });
    if (errors.split) setErrors((e) => ({ ...e, split: "" }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!description.trim()) {
      errs.description = "Description is required.";
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      errs.amount = "Enter a valid amount greater than 0.00";
    }
    if (!payerId) {
      errs.payerId = "Please select who paid.";
    }

    if (splitMode === "equal") {
      if (equalSplitBetween.length === 0) {
        errs.split = "Select at least one member to split with.";
      }
    } else if (splitMode === "exact") {
      const activeCount = Object.values(exactAmounts).filter((v) => parseFloat(v) > 0).length;
      if (activeCount === 0) {
        errs.split = "Enter an exact amount for at least one member.";
      } else if (Math.abs(exactDiffCents) > 1) {
        const diffFormatted = (Math.abs(exactDiffCents) / 100).toFixed(2);
        if (exactDiffCents > 0) {
          errs.split = `Exact amounts are ${currSymbol}${diffFormatted} short of total ${currSymbol}${amt.toFixed(2)}.`;
        } else {
          errs.split = `Exact amounts exceed total ${currSymbol}${amt.toFixed(2)} by ${currSymbol}${diffFormatted}.`;
        }
      }
    } else if (splitMode === "percentage") {
      const activeCount = Object.values(percentages).filter((v) => parseFloat(v) > 0).length;
      if (activeCount === 0) {
        errs.split = "Enter percentages for at least one member.";
      } else if (Math.abs(percentDiff) > 0.5) {
        if (percentDiff > 0) {
          errs.split = `Percentages sum to ${percentSum.toFixed(1)}% (${percentDiff.toFixed(1)}% remaining). Must equal 100%.`;
        } else {
          errs.split = `Percentages sum to ${percentSum.toFixed(1)}% (${Math.abs(percentDiff).toFixed(1)}% over 100%).`;
        }
      }
    } else if (splitMode === "shares") {
      if (totalShares <= 0) {
        errs.split = "At least one member must have 1 or more shares.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const amountCents = Math.round(parseFloat(amount) * 100);

    let splitBetween: string[] = [];
    const splitDetails: Record<string, number> = {};

    if (splitMode === "equal") {
      splitBetween = equalSplitBetween;
    } else if (splitMode === "exact") {
      members.forEach((m) => {
        const val = parseFloat(exactAmounts[m.id]);
        if (!isNaN(val) && val > 0) {
          const c = Math.round(val * 100);
          splitDetails[m.id] = c;
          splitBetween.push(m.id);
        }
      });
    } else if (splitMode === "percentage") {
      members.forEach((m) => {
        const val = parseFloat(percentages[m.id]);
        if (!isNaN(val) && val > 0) {
          splitDetails[m.id] = val;
          splitBetween.push(m.id);
        }
      });
    } else if (splitMode === "shares") {
      members.forEach((m) => {
        const s = shares[m.id] ?? 0;
        if (s > 0) {
          splitDetails[m.id] = s;
          splitBetween.push(m.id);
        }
      });
    }

    onSave({
      id: expense?.id ?? generateId(),
      description: description.trim(),
      amountCents,
      date,
      payerId,
      splitBetween,
      splitMode,
      splitDetails: Object.keys(splitDetails).length > 0 ? splitDetails : undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Subtle ambient tint letting the home page show through clearly */}
      <div
        className="fixed inset-0 -z-20 bg-[#1A1510]/15 animate-in fade-in duration-200 pointer-events-none"
        aria-hidden="true"
      />

      {/* Translucent spotlight background (35% opacity) keeping the dramatic lighting while clearly revealing the home page */}
      <div
        style={{ backgroundImage: "url('/Referance.jpg')" }}
        className="fixed inset-0 -z-10 bg-center sm:bg-[center_72%] bg-cover bg-no-repeat opacity-35 animate-in fade-in duration-200 pointer-events-none"
        aria-hidden="true"
      />

      {/* "Add New Expense" card resting directly within the illuminated spotlight area on the floor/platform */}
      <div
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(120, 80, 40, 0.28), 0 12px 24px -8px rgba(80, 50, 20, 0.18), 0 45px 85px -20px rgba(60, 30, 10, 0.22), 0 4px 6px -2px rgba(120, 80, 40, 0.10)",
        }}
        className="relative w-full max-w-lg bg-[#FFFFFF]/95 sm:bg-[#FFFFFF]/98 backdrop-blur-md rounded-2xl border border-[#E2D6C8] border-t border-amber-100/60 p-6 mt-auto mb-3 sm:mb-8 md:mb-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Subtle top inner light highlight mimicking overhead spotlight hitting the top edge */}
        <div
          className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-200/90 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Ambient floor shadow under the card to enhance the spotlight floor connection */}
        <div
          className="absolute -bottom-3 inset-x-10 h-6 bg-amber-950/20 blur-lg -z-10 pointer-events-none rounded-full"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2D6C8]">
          <h2 id="expense-form-title" className="text-xl font-bold text-[#1A1A1A] tracking-tight">
            {isEdit ? "Edit Expense" : "Add New Expense"}
          </h2>
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Description */}
          <div>
            <label
              htmlFor="exp-description"
              className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
            >
              Description <span className="text-[#C0392B]">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="exp-description"
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((err) => ({ ...err, description: "" }));
              }}
              placeholder="e.g. Seafood Dinner, Beach House, Gas & Tolls"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all ${
                errors.description ? "border-[#C0392B] bg-[#FDECEA]/30" : "border-[#E2D6C8]"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-[#C0392B] mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="exp-amount"
                className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
              >
                Amount ({currSymbol}) <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-bold text-[#6B7280] pointer-events-none">
                  {currSymbol}
                </span>
                <input
                  id="exp-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((err) => ({ ...err, amount: "" }));
                  }}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all ${
                    errors.amount ? "border-[#C0392B] bg-[#FDECEA]/30" : "border-[#E2D6C8]"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-[#C0392B] mt-1 font-medium">{errors.amount}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="exp-date"
                className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
              >
                Date
              </label>
              <input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D6C8] text-sm bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all"
              />
            </div>
          </div>

          {/* Payer selection */}
          <div>
            <label
              htmlFor="exp-payer"
              className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
            >
              Paid by <span className="text-[#C0392B]">*</span>
            </label>
            <select
              id="exp-payer"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D6C8] text-sm font-medium bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all cursor-pointer"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.id === "you" || m.name.toLowerCase() === "you" ? "(You)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Flexible Split Mode Switcher */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Split Method
              </label>
              <span className="text-[11px] text-[#6B7280]">
                {splitMode === "equal" && "Divided equally"}
                {splitMode === "exact" && "Custom dollar amounts"}
                {splitMode === "percentage" && "By percentage (%)"}
                {splitMode === "shares" && "By weight / ratio"}
              </span>
            </div>

            {/* Segmented Mode Control */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#FAF5ED] rounded-xl border border-[#E2D6C8] text-xs font-semibold mb-3">
              <button
                type="button"
                onClick={() => {
                  setSplitMode("equal");
                  if (errors.split) setErrors((e) => ({ ...e, split: "" }));
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  splitMode === "equal"
                    ? "bg-[#2D7D6F] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                = Equal
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplitMode("exact");
                  if (errors.split) setErrors((e) => ({ ...e, split: "" }));
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  splitMode === "exact"
                    ? "bg-[#2D7D6F] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                Exact ({currSymbol})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplitMode("percentage");
                  if (errors.split) setErrors((e) => ({ ...e, split: "" }));
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  splitMode === "percentage"
                    ? "bg-[#2D7D6F] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplitMode("shares");
                  if (errors.split) setErrors((e) => ({ ...e, split: "" }));
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  splitMode === "shares"
                    ? "bg-[#2D7D6F] text-white shadow-xs font-bold"
                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                }`}
              >
                ⚖️ Shares
              </button>
            </div>

            {/* MODE 1: EQUAL SPLIT */}
            {splitMode === "equal" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>Select members sharing this bill:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllEqual}
                      className="text-xs text-[#2D7D6F] hover:underline font-semibold cursor-pointer"
                    >
                      All
                    </button>
                    <span>&middot;</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllEqual}
                      className="text-xs text-[#6B7280] hover:underline font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8]">
                  {members.map((m) => {
                    const isSelected = equalSplitBetween.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleEqualMember(m.id)}
                        aria-pressed={isSelected}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2D7D6F] text-white border-[#2D7D6F] shadow-xs"
                            : "bg-[#FFFFFF] text-[#1A1A1A] border-[#E2D6C8] hover:border-[#2D7D6F]/50"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>

                {equalSplitBetween.length > 0 && totalAmountCents > 0 && (
                  <p className="text-xs text-[#2D7D6F] font-medium bg-[#E6F3F1] px-3 py-1.5 rounded-lg border border-[#2D7D6F]/20">
                    💡 ~{currSymbol}
                    {(totalAmountCents / 100 / equalSplitBetween.length).toFixed(2)} per person (
                    {equalSplitBetween.length}{" "}
                    {equalSplitBetween.length === 1 ? "member" : "members"})
                  </p>
                )}
              </div>
            )}

            {/* MODE 2: EXACT AMOUNTS */}
            {splitMode === "exact" && (
              <div className="space-y-2.5">
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {members.map((m) => {
                    const val = exactAmounts[m.id] ?? "";
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8]"
                      >
                        <span className="text-xs font-semibold text-[#1A1A1A] truncate flex-1">
                          {m.name}
                        </span>
                        <div className="relative w-32 shrink-0">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-[#6B7280] pointer-events-none">
                            {currSymbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={val}
                            onChange={(e) => {
                              const v = e.target.value;
                              setExactAmounts((prev) => ({ ...prev, [m.id]: v }));
                              if (errors.split) setErrors((err) => ({ ...err, split: "" }));
                            }}
                            placeholder="0.00"
                            className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-[#E2D6C8] bg-white text-xs font-bold text-right focus:outline-none focus:border-[#2D7D6F]"
                          />
                        </div>
                        {exactDiffCents > 0 && (
                          <button
                            type="button"
                            onClick={() => handleAutoFillExact(m.id)}
                            title={`Add remaining ${currSymbol}${(exactDiffCents / 100).toFixed(2)} to ${m.name}`}
                            className="text-[10px] text-[#2D7D6F] hover:bg-[#E6F3F1] px-2 py-1 rounded border border-[#2D7D6F]/30 font-semibold cursor-pointer shrink-0"
                          >
                            + Fill Remainder
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Bar */}
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-medium ${
                    Math.abs(exactDiffCents) <= 1
                      ? "bg-[#E6F3F1] border-[#2D7D6F]/30 text-[#1A7F4E]"
                      : "bg-[#FDECEA] border-[#C0392B]/30 text-[#C0392B]"
                  }`}
                >
                  <span>
                    Allocated: {currSymbol}
                    {(exactSumCents / 100).toFixed(2)} / {currSymbol}
                    {(totalAmountCents / 100).toFixed(2)}
                  </span>
                  <span>
                    {Math.abs(exactDiffCents) <= 1 ? (
                      "✅ Exactly matches total!"
                    ) : exactDiffCents > 0 ? (
                      `${currSymbol}${(exactDiffCents / 100).toFixed(2)} remaining`
                    ) : (
                      `${currSymbol}${(Math.abs(exactDiffCents) / 100).toFixed(2)} over`
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* MODE 3: BY PERCENTAGE */}
            {splitMode === "percentage" && (
              <div className="space-y-2.5">
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {members.map((m) => {
                    const val = percentages[m.id] ?? "";
                    const numericVal = parseFloat(val) || 0;
                    const approxCents =
                      totalAmountCents > 0 && numericVal > 0
                        ? Math.round((numericVal / 100) * totalAmountCents)
                        : 0;

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8]"
                      >
                        <div className="truncate flex-1">
                          <span className="text-xs font-semibold text-[#1A1A1A] block truncate">
                            {m.name}
                          </span>
                          {approxCents > 0 && (
                            <span className="text-[11px] text-[#2D7D6F] font-medium">
                              ≈ {currSymbol}{(approxCents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="relative w-28 shrink-0">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={val}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPercentages((prev) => ({ ...prev, [m.id]: v }));
                              if (errors.split) setErrors((err) => ({ ...err, split: "" }));
                            }}
                            placeholder="0"
                            className="w-full pl-2.5 pr-6 py-1.5 rounded-lg border border-[#E2D6C8] bg-white text-xs font-bold text-right focus:outline-none focus:border-[#2D7D6F]"
                          />
                          <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs font-bold text-[#6B7280] pointer-events-none">
                            %
                          </span>
                        </div>
                        {percentDiff > 0 && (
                          <button
                            type="button"
                            onClick={() => handleAutoFillPercent(m.id)}
                            title={`Add remaining ${percentDiff}% to ${m.name}`}
                            className="text-[10px] text-[#2D7D6F] hover:bg-[#E6F3F1] px-2 py-1 rounded border border-[#2D7D6F]/30 font-semibold cursor-pointer shrink-0"
                          >
                            + Fill
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Bar */}
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-medium ${
                    Math.abs(percentDiff) <= 0.5
                      ? "bg-[#E6F3F1] border-[#2D7D6F]/30 text-[#1A7F4E]"
                      : "bg-[#FDECEA] border-[#C0392B]/30 text-[#C0392B]"
                  }`}
                >
                  <span>Allocated: {percentSum.toFixed(1)}% / 100%</span>
                  <span>
                    {Math.abs(percentDiff) <= 0.5 ? (
                      "✅ 100% allocated!"
                    ) : percentDiff > 0 ? (
                      `${percentDiff.toFixed(1)}% remaining`
                    ) : (
                      `${Math.abs(percentDiff).toFixed(1)}% over`
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* MODE 4: BY SHARES / RATIO */}
            {splitMode === "shares" && (
              <div className="space-y-2.5">
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {members.map((m) => {
                    const count = shares[m.id] ?? 1;
                    const sharePct =
                      totalShares > 0 ? ((count / totalShares) * 100).toFixed(1) : "0";
                    const shareAmt =
                      totalShares > 0 && totalAmountCents > 0
                        ? ((count / totalShares) * (totalAmountCents / 100)).toFixed(2)
                        : "0.00";

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8]"
                      >
                        <div className="truncate flex-1">
                          <span className="text-xs font-semibold text-[#1A1A1A] block truncate">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">
                            {count} {count === 1 ? "share" : "shares"} &middot; {sharePct}% (≈{" "}
                            {currSymbol}
                            {shareAmt})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleShareChange(m.id, -1)}
                            disabled={count <= 0}
                            className="w-7 h-7 rounded-lg border border-[#E2D6C8] bg-white hover:bg-[#FAF5ED] disabled:opacity-30 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                            aria-label={`Decrease share for ${m.name}`}
                          >
                            &minus;
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-[#1A1A1A]">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleShareChange(m.id, 1)}
                            className="w-7 h-7 rounded-lg border border-[#E2D6C8] bg-white hover:bg-[#FAF5ED] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                            aria-label={`Increase share for ${m.name}`}
                          >
                            &#43;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Bar */}
                <div className="p-2.5 rounded-xl border border-[#2D7D6F]/30 bg-[#E6F3F1] text-[#2D7D6F] text-xs flex items-center justify-between font-medium">
                  <span>Total: {totalShares} {totalShares === 1 ? "share" : "shares"}</span>
                  <span>
                    {totalShares > 0 && totalAmountCents > 0
                      ? `≈ ${currSymbol}${(totalAmountCents / 100 / totalShares).toFixed(2)} / share`
                      : "Assign shares to members"}
                  </span>
                </div>
              </div>
            )}

            {errors.split && (
              <p className="text-xs text-[#C0392B] mt-1.5 font-medium">{errors.split}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-[#E2D6C8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2D6C8] text-[#1A1A1A] text-sm font-semibold hover:bg-[#FAF5ED] active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D7D6F] text-white text-sm font-semibold hover:bg-[#1F5C52] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/50 cursor-pointer"
            >
              {isEdit ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
