export type Currency = "INR" | "USD" | "EUR";

export type SplitMode = "equal" | "exact" | "percentage" | "shares";

export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  /** Amount in minor units (e.g. paise / cents) */
  amountCents: number;
  date: string; // ISO date string YYYY-MM-DD
  payerId: string;
  splitBetween: string[]; // member ids
  /** Split mode: defaults to "equal" if omitted */
  splitMode?: SplitMode;
  /**
   * For "exact": map of memberId -> cents
   * For "percentage": map of memberId -> percentage (e.g. 60, 40)
   * For "shares": map of memberId -> share count (e.g. 2, 1)
   */
  splitDetails?: Record<string, number>;
}

export interface Group {
  id: string;
  name: string;
  currency: Currency;
  members: Member[];
  expenses: Expense[];
}

export interface Balance {
  memberId: string;
  memberName: string;
  /** Positive = owed money, Negative = owes money */
  netCents: number;
}

export interface Settlement {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountCents: number;
}
