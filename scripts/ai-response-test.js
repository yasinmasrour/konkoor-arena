const { aiClient, aiModel } = require("../src/config/aiProvider");

async function main() {
  console.log("Model:", aiModel);
  console.log("responses.create:", typeof aiClient?.responses?.create);

  const response = await aiClient.responses.create({
    model: aiModel,
    input: "در یک جمله بگو تحلیل آزمون چه فایده‌ای برای دانش‌آموز دارد.",
  });

  console.log("\nResponse received:");
  console.log(response);

  console.log("\nOutput text:");
  console.log(response.output_text);
}

main().catch((error) => {
  console.error("\nAI response test failed:");
  console.error(error);
});
