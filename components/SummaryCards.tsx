"use client";
import { formatCurrency } from "@/lib/calculations";
import type { Balance } from "@/lib/types";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Props {
  totalCents: number;
  currency: string;
  balances: Balance[];
  youId: string;
}

export default function SummaryCards({
  totalCents,
  currency,
  balances,
  youId,
}: Props) {
  const you = balances.find((b) => b.memberId === youId) ?? balances[0];
  const youName = you?.memberName ?? "You";
  const isYou = youName.toLowerCase() === "you";
  const youBalance = you?.netCents ?? 0;
  const youOwe = youBalance < 0 ? -youBalance : 0;
  const owedToYou = youBalance > 0 ? youBalance : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 mb-6 sm:mb-8">
      {/* Total Group Spending */}
      <GlowCard
        customSize
        glowColor="blue"
        className="w-full bg-[#FFFFFF] rounded-2xl shadow-xs p-5 border border-[#E2D6C8] flex flex-col justify-between transition-all hover:shadow-md"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              Total Spending
            </span>
            <span className="w-8 h-8 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] flex items-center justify-center text-[#2D7D6F] shadow-2xs">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {formatCurrency(totalCents, currency, { absolute: true })}
            </div>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">
              Across all group expenses
            </p>
          </div>
        </div>
      </GlowCard>

      {/* You Owe */}
      <GlowCard
        customSize
        glowColor={youOwe > 0 ? "red" : "orange"}
        className={`w-full rounded-2xl shadow-xs p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
          youOwe > 0
            ? "bg-[#FDECEA]/60 border-[#C0392B]/20"
            : "bg-[#FFFFFF] border-[#E2D6C8]"
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                youOwe > 0 ? "text-[#C0392B]" : "text-[#6B7280]"
              }`}
            >
              {isYou ? "You Owe" : `${youName} Owes`}
            </span>
            <span
              className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-2xs ${
                youOwe > 0
                  ? "bg-[#FFFFFF] border-[#C0392B]/30 text-[#C0392B]"
                  : "bg-[#FAF5ED] border-[#E2D6C8] text-[#6B7280]"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                youOwe > 0 ? "text-[#C0392B]" : "text-[#6B7280]"
              }`}
            >
              {formatCurrency(youOwe, currency, { absolute: true })}
            </div>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">
              {youOwe > 0
                ? isYou
                  ? "Your share to pay back"
                  : `${youName}'s share to pay back`
                : isYou
                ? "You have no unpaid share"
                : `${youName} has no unpaid share`}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Owed to You */}
      <GlowCard
        customSize
        glowColor="green"
        className={`w-full rounded-2xl shadow-xs p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
          owedToYou > 0
            ? "bg-[#E6F4EE]/60 border-[#1A7F4E]/20"
            : "bg-[#FFFFFF] border-[#E2D6C8]"
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                owedToYou > 0 ? "text-[#1A7F4E]" : "text-[#6B7280]"
              }`}
            >
              {isYou ? "Owed to You" : `Owed to ${youName}`}
            </span>
            <span
              className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-2xs ${
                owedToYou > 0
                  ? "bg-[#FFFFFF] border-[#1A7F4E]/30 text-[#1A7F4E]"
                  : "bg-[#FAF5ED] border-[#E2D6C8] text-[#6B7280]"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                owedToYou > 0 ? "text-[#1A7F4E]" : "text-[#6B7280]"
              }`}
            >
              {formatCurrency(owedToYou, currency, { absolute: true })}
            </div>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">
              {owedToYou > 0
                ? isYou
                  ? "To be received from members"
                  : `To be received by ${youName}`
                : isYou
                ? "No money owed back to you"
                : `No money owed back to ${youName}`}
            </p>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
