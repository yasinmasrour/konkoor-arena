const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const checks = [
  ["liveness", "/health/live", 200],
  ["readiness", "/health/ready", 200],
  ["root", "/", 200],
  ["swagger", "/api-docs/", 200],
];

(async () => {
  let failed = false;

  for (const [name, path, expectedStatus] of checks) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });

      const ok = response.status === expectedStatus;
      console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${response.status} (expected ${expectedStatus})`);
      if (!ok) failed = true;
    } catch (error) {
      failed = true;
      console.error(`FAIL ${name}: ${error.message}`);
    }
  }

  process.exit(failed ? 1 : 0);
})();
