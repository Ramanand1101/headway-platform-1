// Single source of truth for recharge tiers and per-content-type credit
// costs, shared by any controller that needs to price a credit action.

const RECHARGE_PLANS = [
  { key: 'starter', name: 'Starter', amountInr: 249, credits: 50 },
  { key: 'growth', name: 'Growth', amountInr: 499, credits: 110 },
  { key: 'authority', name: 'Authority', amountInr: 999, credits: 220 }
];

// Repeatable top-up, same rate as Starter, available any time regardless of
// which tier the advisor originally recharged with.
const EXTRA_CREDITS_PACK = { name: 'Extra Credits', amountInr: 249, credits: 50 };

// Cost (in content credits) to unlock/share/download one piece of content,
// by Creative.type.
const CONTENT_COSTS = { image: 10, carousel: 20, reel: 30 };

module.exports = { RECHARGE_PLANS, EXTRA_CREDITS_PACK, CONTENT_COSTS };
