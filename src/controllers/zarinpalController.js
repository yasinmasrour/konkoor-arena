const paymentService = require("../services/paymentService");
const zarinpalService = require("../services/zarinpalService");
const { zarinpalFrontendUrl } = require("../config/env");

/**
 * ساخت URL بازگشت به فرانت
 * مسیر فرانت: /payment/verify
 */
const redirectToResult = ({ paymentId = "", status, message = "" }) => {
  const url = new URL("/payment/verify", zarinpalFrontendUrl);

  url.searchParams.set("gateway", "zarinpal");
  url.searchParams.set("status", status);

  if (paymentId) {
    url.searchParams.set("paymentId", paymentId);
  }

  if (message) {
    url.searchParams.set("message", message);
  }

  return url.toString();
};

const callback = async (req, res) => {
  const authority = req.query.Authority;
  const status = req.query.Status;

  console.log("[ZarinPal] Callback received:", {
    authority,
    status,
  });

  if (!authority) {
    return res.redirect(
      redirectToResult({
        status: "failed",
        message: "شناسه پرداخت دریافت نشد",
      }),
    );
  }

  try {
    const payment = await paymentService.getPaymentByAuthority(authority);

    if (!payment) {
      return res.redirect(
        redirectToResult({
          status: "failed",
          message: "پرداخت موردنظر پیدا نشد",
        }),
      );
    }

    if (payment.status === "paid") {
      return res.redirect(
        redirectToResult({
          paymentId: payment.id,
          status: "success",
        }),
      );
    }

    if (status !== "OK") {
      await paymentService.cancelPayment({
        paymentId: payment.id,
      });

      return res.redirect(
        redirectToResult({
          paymentId: payment.id,
          status: "cancelled",
          message: "پرداخت توسط کاربر لغو شد",
        }),
      );
    }

    const verifyResult = await zarinpalService.verifyPayment({
      amount: payment.amount,
      authority,
    });

    if (!verifyResult.success) {
      await paymentService.failPayment({
        paymentId: payment.id,
      });

      return res.redirect(
        redirectToResult({
          paymentId: payment.id,
          status: "failed",
          message: "تأیید پرداخت در زرین‌پال ناموفق بود",
        }),
      );
    }

    const result = await paymentService.finalizeZarinPalPayment({
      paymentId: payment.id,
      transactionId: verifyResult.refId,
    });

    return res.redirect(
      redirectToResult({
        paymentId: result.payment.id,
        status: "success",
      }),
    );
  } catch (error) {
    console.error("[ZarinPal] Callback error:", error);

    return res.redirect(
      redirectToResult({
        status: "failed",
        message: "خطایی هنگام پردازش پرداخت رخ داد",
      }),
    );
  }
};

module.exports = {
  callback,
};
