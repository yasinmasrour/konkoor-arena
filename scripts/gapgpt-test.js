const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.GAPGPT_API_KEY,
  baseURL: process.env.GAPGPT_BASE_URL,
});

async function main() {
  const response = await client.responses.create({
    model: process.env.GAPGPT_MODEL,
    input: `
تو یک تحلیلگر آموزشی هستی.

برای یک دانش‌آموز که در یک آزمون 20 سواله:
- 14 پاسخ صحیح
- 4 پاسخ غلط
- 2 سوال بدون پاسخ

داشته است، یک تحلیل کوتاه ارائه کن.

فقط JSON معتبر برگردان و هیچ متن دیگری خارج از JSON ننویس.

ساختار خروجی دقیقاً این باشد:

{
  "summary": "string",
  "performanceLevel": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"]
}
`,
  });

  console.log("Raw response:");
  console.log(response.output_text);

  try {
    const parsed = JSON.parse(response.output_text);

    console.log("\nParsed JSON:");
    console.dir(parsed, { depth: null });
  } catch (error) {
    console.error("\nResponse is NOT valid JSON.");
    console.error(error.message);
  }
}

main().catch((error) => {
  console.error("GapGPT test failed:");
  console.error(error.message);
});
