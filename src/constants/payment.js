const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
});

const PAYMENT_GATEWAY = Object.freeze({
  PENDING: "pending",
  WALLET: "wallet", // 🔹 پرداخت از کیف پول
  ZARINPAL: "zarinpal", // 🔹 برای بعداً
  MOCK: "mock", // 🔹 درگاه ساختگی برای تست
});

// 🔹 نوع پرداخت
const PAYMENT_TYPE = Object.freeze({
  SUBSCRIPTION: "subscription", // خرید اشتراک
  WALLET_CHARGE: "wallet_charge", // شارژ کیف پول
  EXAM: "exam", // خرید آزمون (اختیاری)
});

module.exports = { PAYMENT_STATUS, PAYMENT_GATEWAY, PAYMENT_TYPE };
