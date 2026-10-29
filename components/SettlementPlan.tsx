"use client";
import { formatCurrency } from "@/lib/calculations";
import type { Settlement } from "@/lib/types";

interface Props {
  settlements: Settlement[];
  currency: string;
}

export default function SettlementPlan({ settlements, currency }: Props) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E2D6C8] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
            Settlement Plan
          </h2>
          <p className="text-xs text-[#6B7280]">
            Simplest route to square all debts
          </p>
        </div>
        {settlements.length > 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF5ED] text-[#6B7280] border border-[#E2D6C8]">
            {settlements.length} {settlements.length === 1 ? "payment" : "payments"}
          </span>
        )}
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-[#FAF5ED]/60 border border-dashed border-[#E2D6C8]">
          <div className="text-3xl mb-2 select-none">🎉</div>
          <p className="text-sm font-bold text-[#1A1A1A]">All settled up!</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            No member owes money to anyone right now.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {settlements.map((s, idx) => {
            const isFromYou = s.fromId === "you" || s.fromName.toLowerCase() === "you";
            const isToYou = s.toId === "you" || s.toName.toLowerCase() === "you";

            return (
              <li
                key={`${s.fromId}-${s.toId}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5ED] border border-[#E2D6C8] hover:border-[#2D7D6F]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-full bg-[#E2D6C8]/60 flex items-center justify-center text-xs font-bold text-[#1A1A1A] flex-shrink-0">
                    {s.fromName.charAt(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-[#1A1A1A] leading-tight">
                    <span className={`font-semibold ${isFromYou ? "text-[#C0392B]" : ""}`}>
                      {s.fromName}
                    </span>
                    <span className="text-[#6B7280] mx-1">pays</span>
                    <span className={`font-semibold ${isToYou ? "text-[#1A7F4E]" : ""}`}>
                      {s.toName}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-[#2D7D6F] bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#E2D6C8]">
                    {formatCurrency(s.amountCents, currency, { absolute: true })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
