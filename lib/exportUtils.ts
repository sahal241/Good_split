import type { Balance, Group, Settlement } from "./types";
import { formatCurrency, totalSpentCents, calculateMemberTotals } from "./calculations";

function escapeCSV(val: string | number): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(
  group: Group,
  balances: Balance[],
  settlements: Settlement[]
): string {
  const memberMap = Object.fromEntries(group.members.map((m) => [m.id, m.name]));
  const memberTotals = calculateMemberTotals(group.members, group.expenses);
  const total = totalSpentCents(group.expenses);
  const lines: string[] = [];

  // UTF-8 BOM for Microsoft Excel compatibility
  const BOM = "\uFEFF";

  // 1. Group Header Overview
  lines.push("GOODSPLIT — EXPENSE & SETTLEMENT REPORT");
  lines.push(`Group Name,${escapeCSV(group.name)}`);
  lines.push(`Currency,${escapeCSV(group.currency)}`);
  lines.push(`Total Spending,${escapeCSV(formatCurrency(total, group.currency, { absolute: true }))}`);
  lines.push(`Total Expenses,${group.expenses.length}`);
  lines.push(`Members Count,${group.members.length}`);
  lines.push(`Exported On,${new Date().toISOString().split("T")[0]}`);
  lines.push("");

  // 2. Expense Ledger
  lines.push("--- EXPENSE LEDGER ---");
  lines.push("Date,Description,Paid By,Total Amount,Split Method,Split Details / Breakdown,Split Count,Cost Per Person / Allocation");

  if (group.expenses.length === 0) {
    lines.push("No expenses recorded yet.");
  } else {
    // Sort descending by date
    const sorted = [...group.expenses].sort((a, b) => b.date.localeCompare(a.date));
    for (const exp of sorted) {
      const payerName = memberMap[exp.payerId] ?? "Unknown";
      const mode = exp.splitMode ?? "equal";
      const splitCount = exp.splitBetween.length;
      const perPerson = splitCount > 0 ? Math.floor(exp.amountCents / splitCount) : exp.amountCents;

      let splitMethodLabel = "Equal";
      let splitDetailsText = "";
      let costPerPersonText = formatCurrency(perPerson, group.currency, { absolute: true });

      if (mode === "exact" && exp.splitDetails) {
        splitMethodLabel = "Exact Amounts";
        splitDetailsText = exp.splitBetween
          .map((id) => `${memberMap[id] ?? "Unknown"}: ${formatCurrency(exp.splitDetails?.[id] ?? 0, group.currency, { absolute: true })}`)
          .join("; ");
        costPerPersonText = "Custom";
      } else if (mode === "percentage" && exp.splitDetails) {
        splitMethodLabel = "Percentage";
        splitDetailsText = exp.splitBetween
          .map((id) => `${memberMap[id] ?? "Unknown"}: ${exp.splitDetails?.[id]}%`)
          .join("; ");
        costPerPersonText = "Percentage";
      } else if (mode === "shares" && exp.splitDetails) {
        splitMethodLabel = "Shares / Ratio";
        splitDetailsText = exp.splitBetween
          .map((id) => `${memberMap[id] ?? "Unknown"}: ${exp.splitDetails?.[id]} shares`)
          .join("; ");
        costPerPersonText = "By Shares";
      } else {
        splitDetailsText = exp.splitBetween.map((id) => memberMap[id] ?? "Unknown").join("; ");
      }

      lines.push(
        [
          escapeCSV(exp.date),
          escapeCSV(exp.description),
          escapeCSV(payerName),
          escapeCSV(formatCurrency(exp.amountCents, group.currency, { absolute: true })),
          escapeCSV(splitMethodLabel),
          escapeCSV(splitDetailsText),
          splitCount,
          escapeCSV(costPerPersonText),
        ].join(",")
      );
    }
  }
  lines.push("");

  // 3. Member Balances
  lines.push("--- MEMBER BALANCES & BREAKDOWN ---");
  lines.push("Member Name,Total Paid,Total Share Owed,Net Balance,Status");
  for (const m of memberTotals) {
    const isPositive = m.netCents > 0;
    const isNegative = m.netCents < 0;
    const status = isPositive ? "Gets back" : isNegative ? "Owes" : "Settled";
    const netFormatted = `${isPositive ? "+" : ""}${formatCurrency(m.netCents, group.currency)}`;

    lines.push(
      [
        escapeCSV(m.memberName),
        escapeCSV(formatCurrency(m.paidCents, group.currency, { absolute: true })),
        escapeCSV(formatCurrency(m.shareCents, group.currency, { absolute: true })),
        escapeCSV(netFormatted),
        escapeCSV(status),
      ].join(",")
    );
  }
  lines.push("");

  // 4. Final Settlement Plan
  lines.push("--- FINAL SETTLEMENT PLAN (MINIMIZED PAYMENTS) ---");
  lines.push("Who Pays (Debtor),Who Receives (Creditor),Amount");

  if (settlements.length === 0) {
    lines.push("All members are fully settled up! No payments required.");
  } else {
    for (const s of settlements) {
      lines.push(
        [
          escapeCSV(s.fromName),
          escapeCSV(s.toName),
          escapeCSV(formatCurrency(s.amountCents, group.currency, { absolute: true })),
        ].join(",")
      );
    }
  }

  return BOM + lines.join("\r\n");
}

export function downloadCSVFile(
  group: Group,
  balances: Balance[],
  settlements: Settlement[]
): void {
  const csvContent = generateCSV(group, balances, settlements);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const safeName = group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const dateStr = new Date().toISOString().split("T")[0];

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${safeName || "goodsplit"}-expenses-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateClipboardSummary(
  group: Group,
  balances: Balance[],
  settlements: Settlement[]
): string {
  const total = totalSpentCents(group.expenses);
  const dateStr = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(`📊 *${group.name}* — Expense Summary`);
  lines.push(`📅 Date: ${dateStr}`);
  lines.push(`💰 Total Spending: ${formatCurrency(total, group.currency, { absolute: true })} (${group.expenses.length} expenses)`);
  lines.push("");

  lines.push(`⚖️ *Member Balances:*`);
  balances.forEach((b) => {
    const isPositive = b.netCents > 0;
    const isNegative = b.netCents < 0;
    const sign = isPositive ? "+" : "";
    const label = isPositive ? "(gets back)" : isNegative ? "(owes)" : "(settled)";
    lines.push(`• ${b.memberName}: ${sign}${formatCurrency(b.netCents, group.currency)} ${label}`);
  });
  lines.push("");

  lines.push(`🤝 *Settlement Plan:*`);
  if (settlements.length === 0) {
    lines.push(`🎉 All settled up! No payments needed.`);
  } else {
    settlements.forEach((s) => {
      lines.push(`• *${s.fromName}* pays *${s.toName}*: ${formatCurrency(s.amountCents, group.currency, { absolute: true })}`);
    });
  }

  lines.push("");
  lines.push(`— Split fairly with GoodSplit`);
  return lines.join("\n");
}
