-- ==================== ۱) آپدیت Referral ====================
UPDATE "Referral"
SET
  "referrerReward" = "referrerReward" * 10,
  "refereeDiscount" = "refereeDiscount" * 10
WHERE "referrerReward" < 10000000;  -- فقط اونایی که ۱۰ برابر نشدن

-- ==================== ۲) آپدیت WalletTransaction ====================
UPDATE "WalletTransaction"
SET
  "amount" = "amount" * 10,
  "balanceBefore" = "balanceBefore" * 10,
  "balanceAfter" = "balanceAfter" * 10
WHERE
  "referenceType" IN ('REFERRAL', 'REFERRAL_MILESTONE')
  AND "type" = 'REWARD';

-- ==================== ۳) آپدیت Wallet.balance ====================
-- balance کاربرانی که تراکنش REFERRAL دارن رو ۱۰ برابر کن
UPDATE "Wallet"
SET "balance" = "balance" * 10
WHERE "userId" IN (
  SELECT DISTINCT "userId"
  FROM "WalletTransaction"
  WHERE "referenceType" IN ('REFERRAL', 'REFERRAL_MILESTONE')
    AND "type" = 'REWARD'
);

-- ==================== ۴) آپدیت Payment.discountAmount ====================
UPDATE "Payment"
SET "discountAmount" = "discountAmount" * 10
WHERE "discountAmount" > 0
  AND "discountAmount" < 10000000;