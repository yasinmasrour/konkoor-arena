const { aiClient, aiModel } = require("../src/config/aiProvider");

async function main() {
  if (!aiClient) {
    throw new Error("AI client is not configured.");
  }

  console.time("[TEST] GapGPT");

  const response = await aiClient.responses.create({
    model: aiModel,
    input: "در یک جمله بگو آزمون آزمایشی چه فایده‌ای دارد.",
  });

  console.timeEnd("[TEST] GapGPT");

  console.log("Model:", response.model);
  console.log("Response:", response.output_text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});