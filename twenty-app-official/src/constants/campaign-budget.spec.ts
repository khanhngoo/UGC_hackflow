import { describe, expect, it } from 'vitest';

import { computeBudgetUsePercent } from 'src/constants/campaign-budget';

describe('computeBudgetUsePercent', () => {
  it('returns null when budget is missing or zero', () => {
    expect(computeBudgetUsePercent(null, 100)).toBeNull();
    expect(computeBudgetUsePercent(0, 100)).toBeNull();
  });

  it('computes percentage from budget and used amount', () => {
    expect(computeBudgetUsePercent(10000, 2500)).toBe(25);
    expect(computeBudgetUsePercent(10000, 3333)).toBe(33.33);
  });
});
