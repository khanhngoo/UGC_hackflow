/** Derive budget use % from budget and amount used (0–100, two decimal places). */
export function computeBudgetUsePercent(
  budget: number | null | undefined,
  budgetUsed: number | null | undefined,
): number | null {
  if (budget == null || budget <= 0) {
    return null;
  }

  const used = budgetUsed ?? 0;
  return Math.round((used / budget) * 10000) / 100;
}
