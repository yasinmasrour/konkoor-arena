const { S3Client } = require("@aws-sdk/client-s3");
const env = require("./env");

/**
 * Arvan S3 (Ceph-based) — نیاز به path-style داره
 *
 * چرا forcePathStyle: true؟
 *   Arvan از Ceph استفاده می‌کنه که با virtual-hosted style
 *   (bucket.endpoint/key) سازگاری کامل نداره. با path-style
 *   (endpoint/bucket/key) همه‌چیز درست کار می‌کنه.
 */
const s3 = new S3Client({
  region: env.s3Region || "ir-central1",
  endpoint: env.s3Endpoint,
  credentials: {
    accessKeyId: env.s3AccessKey,
    secretAccessKey: env.s3SecretKey,
  },
  forcePathStyle: true, // 🆕 Arvan/Ceph نیاز داره
});

module.exports = s3;