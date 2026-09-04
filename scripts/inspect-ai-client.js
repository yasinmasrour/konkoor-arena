const { aiClient, aiModel } = require("../src/config/aiProvider");

console.log("AI client exists:", !!aiClient);
console.log("AI model:", aiModel);

console.log("responses exists:", !!aiClient?.responses);
console.log("responses.create type:", typeof aiClient?.responses?.create);

console.log("chat exists:", !!aiClient?.chat);
console.log(
  "chat.completions.create type:",
  typeof aiClient?.chat?.completions?.create,
);
