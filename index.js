const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/ask", async (req, res) => {
  const { question, context } = req.body;

  try {
    const prompt = `
You are a helpful assistant. Use the provided document context below to answer the user's question.
If the answer is found on a specific page, mention the page number clearly (e.g., "see page 2").

Document:
"""${context}"""
`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question },
      ],
    });

    const answer = response.data.choices[0].message.content;

    const match = answer.match(/page\\s+(\\d+)/i);
    const page = match ? parseInt(match[1]) : null;

    res.json({ answer, page });
  } catch (err) {
    console.error("❌ OpenAI Error:", err.message);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running at http://localhost:5000");
});
