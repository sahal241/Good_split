import type { Balance, Expense, Member, Settlement } from "./types";

/**
 * Computes each involved member's owed share in cents for an expense.
 * Guarantees that the sum of returned cents EXACTLY equals expense.amountCents.
 */
export function getExpenseShares(expense: Expense): Record<string, number> {
  const result: Record<string, number> = {};
  const participants = expense.splitBetween;
  const n = participants.length;

  if (n === 0 || expense.amountCents <= 0) {
    return result;
  }

  const mode = expense.splitMode ?? "equal";
  const details = expense.splitDetails ?? {};

  if (mode === "exact") {
    let totalAssigned = 0;
    participants.forEach((id) => {
      const cents = Math.max(0, Math.round(details[id] ?? 0));
      result[id] = cents;
      totalAssigned += cents;
    });

    const diff = expense.amountCents - totalAssigned;
    if (diff !== 0 && participants[0]) {
      result[participants[0]] = Math.max(0, (result[participants[0]] ?? 0) + diff);
    }
    return result;
  }

  if (mode === "percentage") {
    let allocatedSum = 0;
    const remainders: { id: string; frac: number }[] = [];

    participants.forEach((id) => {
      const pct = Math.max(0, details[id] ?? 0);
      const exactCents = (pct / 100) * expense.amountCents;
      const floorCents = Math.floor(exactCents);
      const frac = exactCents - floorCents;
      result[id] = floorCents;
      allocatedSum += floorCents;
      remainders.push({ id, frac });
    });

    let diff = expense.amountCents - allocatedSum;
    remainders.sort((a, b) => b.frac - a.frac);
    let i = 0;
    while (diff > 0 && remainders.length > 0) {
      const target = remainders[i % remainders.length];
      result[target.id] = (result[target.id] ?? 0) + 1;
      diff--;
      i++;
    }
    return result;
  }

  if (mode === "shares") {
    let totalShares = 0;
    participants.forEach((id) => {
      const s = Math.max(0, Math.round(details[id] ?? 1));
      totalShares += s;
    });

    if (totalShares <= 0) {
      return getEqualShares(expense.amountCents, participants);
    }

    let allocatedSum = 0;
    const remainders: { id: string; frac: number }[] = [];

    participants.forEach((id) => {
      const s = Math.max(0, Math.round(details[id] ?? 1));
      const exactCents = (s / totalShares) * expense.amountCents;
      const floorCents = Math.floor(exactCents);
      const frac = exactCents - floorCents;
      result[id] = floorCents;
      allocatedSum += floorCents;
      remainders.push({ id, frac });
    });

    let diff = expense.amountCents - allocatedSum;
    remainders.sort((a, b) => b.frac - a.frac);
    let i = 0;
    while (diff > 0 && remainders.length > 0) {
      const target = remainders[i % remainders.length];
      result[target.id] = (result[target.id] ?? 0) + 1;
      diff--;
      i++;
    }
    return result;
  }

  return getEqualShares(expense.amountCents, participants);
}

function getEqualShares(amountCents: number, participants: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  const n = participants.length;
  if (n === 0) return result;
  const baseShare = Math.floor(amountCents / n);
  const remainder = amountCents % n;

  participants.forEach((id, idx) => {
    result[id] = idx < remainder ? baseShare + 1 : baseShare;
  });

  return result;
}

/**
 * Calculates each member's net balance in cents.
 * Positive  → member is owed money.
 * Negative  → member owes money.
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): Balance[] {
  const netMap: Record<string, number> = {};
  members.forEach((m) => (netMap[m.id] = 0));

  for (const exp of expenses) {
    // Payer gets full credit
    netMap[exp.payerId] = (netMap[exp.payerId] ?? 0) + exp.amountCents;

    // Deduct each member's calculated share
    const shares = getExpenseShares(exp);
    for (const [memberId, owedCents] of Object.entries(shares)) {
      netMap[memberId] = (netMap[memberId] ?? 0) - owedCents;
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    netCents: netMap[m.id] ?? 0,
  }));
}

export interface MemberTotal {
  memberId: string;
  memberName: string;
  paidCents: number;
  shareCents: number;
  netCents: number;
}

/**
 * Calculates per-member breakdown of total amount paid vs total share owed.
 */
export function calculateMemberTotals(
  members: Member[],
  expenses: Expense[]
): MemberTotal[] {
  const paidMap: Record<string, number> = {};
  const shareMap: Record<string, number> = {};
  members.forEach((m) => {
    paidMap[m.id] = 0;
    shareMap[m.id] = 0;
  });

  for (const exp of expenses) {
    paidMap[exp.payerId] = (paidMap[exp.payerId] ?? 0) + exp.amountCents;

    const shares = getExpenseShares(exp);
    for (const [memberId, owedCents] of Object.entries(shares)) {
      shareMap[memberId] = (shareMap[memberId] ?? 0) + owedCents;
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    paidCents: paidMap[m.id] ?? 0,
    shareCents: shareMap[m.id] ?? 0,
    netCents: (paidMap[m.id] ?? 0) - (shareMap[m.id] ?? 0),
  }));
}

/**
 * Greedy debt-minimisation: matches the largest creditor with the
 * largest debtor until all balances are settled.
 */
export function calculateSettlements(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.netCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netCents - a.netCents);
  const debtors = balances
    .filter((b) => b.netCents < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.netCents - b.netCents); // most negative first

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.netCents, -debtor.netCents);

    if (amount > 0) {
      settlements.push({
        fromId: debtor.memberId,
        fromName: debtor.memberName,
        toId: creditor.memberId,
        toName: creditor.memberName,
        amountCents: amount,
      });
    }

    creditor.netCents -= amount;
    debtor.netCents += amount;

    if (creditor.netCents <= 0) ci++;
    if (debtor.netCents >= 0) di++;
  }

  return settlements;
}

export function formatCurrency(
  cents: number,
  currency: string,
  options?: { showSign?: boolean; absolute?: boolean }
): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const major = absCents / 100;

  let symbol = "₹";
  let locale = "en-IN";
  if (currency === "USD") {
    symbol = "$";
    locale = "en-US";
  } else if (currency === "EUR") {
    symbol = "€";
    locale = "en-IE";
  } else if (currency === "INR") {
    symbol = "₹";
    locale = "en-IN";
  }

  const formattedNum = major.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (options?.absolute) {
    return `${symbol}${formattedNum}`;
  }

  if (options?.showSign && cents > 0) {
    return `+${symbol}${formattedNum}`;
  }

  if (isNegative) {
    return `-${symbol}${formattedNum}`;
  }

  return `${symbol}${formattedNum}`;
}

export function totalSpentCents(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0);
}
