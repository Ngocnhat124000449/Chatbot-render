const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

// 🔐 Load biến môi trường từ .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔁 Cho phép các request từ trình duyệt
app.use(cors());
app.use(express.json());

// 📂 Phục vụ file tĩnh trong thư mục "public"
app.use(express.static("public"));

// 🔁 Endpoint để proxy yêu cầu từ client đến OpenAI
app.post("/v1/responses", async (req, res) => {
  const { input, model } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model || "gpt-3.5-turbo",
        messages: input,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const output = response.data.choices.map((choice) => ({
      content: [{ text: choice.message.content }],
    }));

    res.json({ output });
  } catch (error) {
    console.error("❌ Lỗi proxy:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Lỗi khi gọi API OpenAI",
      details: error.response?.data || error.message,
    });
  }
});

// 🚀 Bắt đầu server
app.listen(PORT, () => {
  console.log(`✅ Proxy đang chạy tại http://localhost:${PORT}/v1/responses`);
});
