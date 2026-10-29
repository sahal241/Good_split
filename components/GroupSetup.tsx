"use client";
import { useState } from "react";
import type { Currency, Group, Member } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface Props {
  onCreateGroup: (group: Group) => void;
}

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "INR", label: "INR", symbol: "₹" },
  { code: "USD", label: "USD", symbol: "$" },
  { code: "EUR", label: "EUR", symbol: "€" },
];

export default function GroupSetup({ onCreateGroup }: Props) {
  const [teamName, setTeamName] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [memberNames, setMemberNames] = useState<string[]>(["You", "", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setMemberCount(count: number) {
    const clamped = Math.max(2, Math.min(20, count));
    setMemberNames((prev) => {
      if (clamped > prev.length) {
        const added = Array(clamped - prev.length).fill("");
        return [...prev, ...added];
      } else {
        return prev.slice(0, clamped);
      }
    });
  }

  function handleNameChange(index: number, val: string) {
    setMemberNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
    if (errors[`member_${index}`]) {
      setErrors((err) => {
        const copy = { ...err };
        delete copy[`member_${index}`];
        delete copy.duplicate;
        return copy;
      });
    }
  }

  function handleAddMember() {
    if (memberNames.length < 20) {
      setMemberNames((prev) => [...prev, ""]);
    }
  }

  function handleRemoveMember(index: number) {
    if (memberNames.length > 2) {
      setMemberNames((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!teamName.trim()) {
      errs.teamName = "Please enter a team or group name.";
    }

    if (memberNames.length < 2) {
      errs.members = "A group must have at least 2 members.";
    }

    const trimmed = memberNames.map((m) => m.trim());
    const seen = new Set<string>();
    let hasDuplicate = false;

    trimmed.forEach((name, idx) => {
      if (!name) {
        errs[`member_${idx}`] = `Please enter a name for Member ${idx + 1}.`;
      } else {
        const lower = name.toLowerCase();
        if (seen.has(lower)) {
          hasDuplicate = true;
          errs[`member_${idx}`] = `"${name}" is already listed.`;
        }
        seen.add(lower);
      }
    });

    if (hasDuplicate) {
      errs.duplicate = "All member names must be distinct.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const members: Member[] = memberNames.map((name, idx) => {
      const clean = name.trim();
      const isYou = clean.toLowerCase() === "you" || idx === 0;
      return {
        id: isYou ? "you" : generateId(),
        name: clean,
      };
    });

    const newGroup: Group = {
      id: generateId(),
      name: teamName.trim(),
      currency,
      members,
      expenses: [],
    };

    onCreateGroup(newGroup);
  }

  return (
    <div className="min-h-screen bg-[#F3ECE1] text-[#1A1A1A] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Brand Badge */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#2D7D6F] flex items-center justify-center text-white shadow-md font-extrabold text-xl select-none font-heading">
          GS
        </div>
        <div>
          <span className="font-extrabold text-2xl text-[#1A1A1A] tracking-tight font-heading">
            Good<span className="text-[#2D7D6F]">Split</span>
          </span>
          <span className="block text-xs text-[#6B7280] font-medium">
            Fair & calm group expense splitting
          </span>
        </div>
      </div>

      {/* Main Setup Card */}
      <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2D6C8] w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
            Create Your Group
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Give your group a name, choose your currency, and list your members to begin.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Team / Group Name */}
          <div>
            <label
              htmlFor="team-name"
              className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1.5"
            >
              Team or Group Name <span className="text-[#C0392B]">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              autoFocus
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (errors.teamName) {
                  setErrors((err) => {
                    const copy = { ...err };
                    delete copy.teamName;
                    return copy;
                  });
                }
              }}
              placeholder="e.g. Goa Vacation, Apartment 302, Weekend Trip"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all ${
                errors.teamName
                  ? "border-[#C0392B] bg-[#FDECEA]/30"
                  : "border-[#E2D6C8]"
              }`}
            />
            {errors.teamName && (
              <p className="text-xs text-[#C0392B] mt-1.5 font-medium">
                {errors.teamName}
              </p>
            )}
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">
              Currency
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {CURRENCIES.map((c) => {
                const isSelected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-[#2D7D6F] text-white border-[#2D7D6F] shadow-xs"
                        : "bg-[#FAF5ED] text-[#1A1A1A] border-[#E2D6C8] hover:border-[#2D7D6F]/40"
                    }`}
                  >
                    <span className="font-bold">{c.symbol}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Members Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Number of Members
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMemberCount(memberNames.length - 1)}
                  disabled={memberNames.length <= 2}
                  className="w-7 h-7 rounded-lg border border-[#E2D6C8] bg-[#FAF5ED] hover:bg-[#E2D6C8] disabled:opacity-40 disabled:hover:bg-[#FAF5ED] font-bold text-sm flex items-center justify-center transition-colors"
                  aria-label="Decrease members"
                >
                  &minus;
                </button>
                <span className="text-sm font-extrabold text-[#1A1A1A] w-6 text-center">
                  {memberNames.length}
                </span>
                <button
                  type="button"
                  onClick={() => setMemberCount(memberNames.length + 1)}
                  disabled={memberNames.length >= 20}
                  className="w-7 h-7 rounded-lg border border-[#E2D6C8] bg-[#FAF5ED] hover:bg-[#E2D6C8] disabled:opacity-40 disabled:hover:bg-[#FAF5ED] font-bold text-sm flex items-center justify-center transition-colors"
                  aria-label="Increase members"
                >
                  &#43;
                </button>
              </div>
            </div>

            {/* Quick Count Stepper Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[2, 3, 4, 5, 6, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMemberCount(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    memberNames.length === num
                      ? "bg-[#2D7D6F] text-white border-[#2D7D6F]"
                      : "bg-[#FAF5ED] text-[#6B7280] border-[#E2D6C8] hover:text-[#1A1A1A]"
                  }`}
                >
                  {num} People
                </button>
              ))}
            </div>

            {/* Members Input List */}
            <div className="space-y-2.5">
              {memberNames.map((name, idx) => {
                const isFirst = idx === 0;
                const errKey = `member_${idx}`;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-[#6B7280] shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={
                          isFirst
                            ? "You (or your name)"
                            : `Member ${idx + 1} name`
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm bg-[#FAF5ED] focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/40 transition-all ${
                          errors[errKey]
                            ? "border-[#C0392B] bg-[#FDECEA]/30"
                            : "border-[#E2D6C8]"
                        }`}
                      />
                      {errors[errKey] && (
                        <p className="text-[11px] text-[#C0392B] mt-1 font-medium">
                          {errors[errKey]}
                        </p>
                      )}
                    </div>

                    {memberNames.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-[#6B7280] hover:text-[#C0392B] p-1.5 rounded-lg hover:bg-[#FAF5ED] transition-colors shrink-0"
                        title="Remove member"
                        aria-label={`Remove Member ${idx + 1}`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Member Link */}
            {memberNames.length < 20 && (
              <button
                type="button"
                onClick={handleAddMember}
                className="mt-3 text-xs font-semibold text-[#2D7D6F] hover:text-[#1F5C52] inline-flex items-center gap-1 transition-colors"
              >
                <span>&#43; Add another member</span>
              </button>
            )}

            {errors.duplicate && (
              <p className="text-xs text-[#C0392B] mt-2 font-medium">
                {errors.duplicate}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2D7D6F] text-white text-sm font-bold hover:bg-[#1F5C52] active:scale-[0.99] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D7D6F]/50 flex items-center justify-center gap-2"
            >
              <span>Create Group &amp; Start Splitting</span>
              <span>&rarr;</span>
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-8 text-center text-xs text-[#6B7280]">
        All group details are saved locally in your browser. No sign-up required.
      </footer>
    </div>
  );
}
