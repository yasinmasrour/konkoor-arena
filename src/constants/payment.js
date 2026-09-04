const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

const PAYMENT_GATEWAY = Object.freeze({
  PENDING: "pending",
});

module.exports = { PAYMENT_STATUS, PAYMENT_GATEWAY };
