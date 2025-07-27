const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lịch sử hội thoại
const chatHistory = [
  {
    role: "system",
    content: `
Bạn là một chatbot hướng dẫn học tập thông minh, thân thiện và đầy cảm hứng.  
Nhiệm vụ của bạn là giúp sinh viên xác định mục tiêu, kỹ năng, và xây dựng lộ trình học tập cá nhân hóa. 

1. Tự đặt câu hỏi để thu thập thông tin (ngành học, mục tiêu, kỹ năng, phong cách học, thời gian học,...)
2. Đưa ra kế hoạch học chi tiết và truyền động lực
3. Nếu người dùng nói lan man, khéo léo đưa về chủ đề học tập

Hãy bắt đầu cuộc trò chuyện một cách thân thiện và dẫn dắt sinh viên từng bước.
    `
  },
  {
    role: "user",
    content: "Chào bạn!"
  }
];

// Hàm hiển thị tin nhắn
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// Gửi tin nhắn đến server và xử lý phản hồi
async function sendToGPT() {
  const botDiv = addMessage("...", "bot"); // chờ phản hồi

  try {
    const response = await fetch("/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: chatHistory,
      }),
    });

    const json = await response.json();
    const output_text = json?.output?.[0]?.content?.[0]?.text || "⚠️ Không có phản hồi từ chatbot.";

    botDiv.textContent = output_text;
    chatHistory.push({ role: "assistant", content: output_text });
  } catch (error) {
    botDiv.textContent = "❌ Lỗi: " + error.message;
  }
}

// Khởi động khi trang load
window.addEventListener("DOMContentLoaded", () => {
  sendToGPT();
});

// Gửi khi người dùng nhập
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");
  chatHistory.push({ role: "user", content: userMessage });

  sendToGPT();
});
