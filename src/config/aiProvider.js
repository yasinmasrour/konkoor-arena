const OpenAI = require("openai");

const { gapgptApiKey, gapgptBaseUrl, gapgptModel } = require("./env");

const aiClient = gapgptApiKey
  ? new OpenAI({
      apiKey: gapgptApiKey,
      baseURL: gapgptBaseUrl,
    })
  : null;

module.exports = {
  aiClient,
  aiModel: gapgptModel,
};
