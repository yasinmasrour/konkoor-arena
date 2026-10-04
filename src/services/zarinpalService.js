const AppError = require("../utils/appError");

const ZARINPAL_BASE_URL =
  process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com"
    : "https://payment.zarinpal.com";

const ZARINPAL_START_PAY_URL =
  process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com/pg/StartPay"
    : "https://www.zarinpal.com/pg/StartPay";

const REQUEST_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/request.json`;
const VERIFY_URL = `${ZARINPAL_BASE_URL}/pg/v4/payment/verify.json`;

const getMerchantId = () => {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;

  if (!merchantId) {
    throw new AppError(
      "درگاه زرین‌پال در سرور پیکربندی نشده است",
      500,
    );
  }

  return merchantId;
};

/**
 * تبدیل مبلغ ذخیره‌شده در سیستم به مبلغ مورد نیاز زرین‌پال.
 *
 * سیستم ما مبالغ را بر اساس ریال نگه می‌دارد،
 * بنابراین در اینجا هیچ تبدیل Toman → Rial انجام نمی‌شود.
 */
const normalizeAmount = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
    throw new AppError("مبلغ پرداخت نامعتبر است", 400);
  }

  return numericAmount;
};

/**
 * ایجاد درخواست پرداخت در زرین‌پال
 */
const requestPayment = async ({
  amount,
  callbackUrl,
  description,
  mobile,
  email,
}) => {
  const merchantId = getMerchantId();
  const normalizedAmount = normalizeAmount(amount);

  if (!callbackUrl) {
    throw new AppError("آدرس بازگشت پرداخت مشخص نشده است", 500);
  }

  if (!description) {
    throw new AppError("توضیحات پرداخت مشخص نشده است", 500);
  }

  let response;

  try {
    response = await fetch(REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: normalizedAmount,
        callback_url: callbackUrl,
        description,
        metadata: {
          ...(mobile ? { mobile } : {}),
          ...(email ? { email } : {}),
        },
      }),
    });
  } catch (error) {
    console.error("[ZarinPal] Request connection error:", error);

    throw new AppError(
      "ارتباط با درگاه زرین‌پال برقرار نشد",
      502,
    );
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    console.error("[ZarinPal] Invalid response:", error);

    throw new AppError(
      "پاسخ نامعتبر از درگاه زرین‌پال دریافت شد",
      502,
    );
  }

  const authority = data?.data?.authority;
  const code = data?.data?.code;

  if (!response.ok || code !== 100 || !authority) {
    console.error("[ZarinPal] Payment request failed:", {
      httpStatus: response.status,
      code,
      errors: data?.errors,
    });

    throw new AppError(
      "ایجاد درخواست پرداخت در زرین‌پال ناموفق بود",
      502,
    );
  }

  return {
    authority,
    paymentUrl: `${ZARINPAL_START_PAY_URL}/${authority}`,
    raw: data,
  };
};

/**
 * تأیید پرداخت در زرین‌پال
 */
const verifyPayment = async ({
  amount,
  authority,
}) => {
  const merchantId = getMerchantId();
  const normalizedAmount = normalizeAmount(amount);

  if (!authority) {
    throw new AppError("Authority پرداخت وجود ندارد", 400);
  }

  let response;

  try {
    response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: normalizedAmount,
        authority,
      }),
    });
  } catch (error) {
    console.error("[ZarinPal] Verify connection error:", error);

    throw new AppError(
      "ارتباط با زرین‌پال برای تأیید پرداخت برقرار نشد",
      502,
    );
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    console.error("[ZarinPal] Invalid verify response:", error);

    throw new AppError(
      "پاسخ نامعتبر از زرین‌پال هنگام تأیید پرداخت دریافت شد",
      502,
    );
  }

  const code = data?.data?.code;
  const refId = data?.data?.ref_id;

  // 100 = پرداخت با موفقیت تأیید شده
  if (code === 100) {
    return {
      success: true,
      alreadyVerified: false,
      refId: refId != null ? String(refId) : null,
      code,
      raw: data,
    };
  }

  // 101 = قبلاً تأیید شده
  if (code === 101) {
    return {
      success: true,
      alreadyVerified: true,
      refId: refId != null ? String(refId) : null,
      code,
      raw: data,
    };
  }

  return {
    success: false,
    alreadyVerified: false,
    refId: null,
    code,
    raw: data,
  };
};

module.exports = {
  requestPayment,
  verifyPayment,
};