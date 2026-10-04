const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
});

const PAYMENT_GATEWAY = Object.freeze({
  PENDING: "pending",
  WALLET: "wallet",
  ZARINPAL: "zarinpal",
});

const PAYMENT_TYPE = Object.freeze({
  SUBSCRIPTION: "subscription",
  WALLET_CHARGE: "wallet_charge",
  EXAM: "exam",
  EXAM_PURCHASE: "exam_purchase",
});

module.exports = { PAYMENT_STATUS, PAYMENT_GATEWAY, PAYMENT_TYPE };
