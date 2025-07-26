const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lưu lịch sử hội thoại giữa user và bot
const chatHistory = [
  {
    role: "system",
    content:
      "Bạn là một trợ lý AI hữu ích, hãy trả lời câu hỏi của người dùng, hãy trả lời bằng tiếng Việt\n" +
      "Bây giờ là " +
      new Date().toLocaleString(),
  },
];

// Gửi form chat
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");
  chatHistory.push({ role: "user", content: userMessage });
  await streamMessage();
});

// Hiển thị tin nhắn mới
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// Hiển thị các tin nhắn ban đầu từ chatHistory
for (const message of chatHistory) {
  addMessage(message.content, message.role);
}

// Gọi API /v1/responses và xử lý stream
async function streamMessage() {
  const botDiv = addMessage("...", "bot");
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const output_text = json.output[0].content[0].text;
    botDiv.textContent = output_text;
    chatHistory.push({ role: "assistant", content: output_text });
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    botDiv.textContent = "❌ Lỗi phản hồi từ server: " + error.message;
  }
}
